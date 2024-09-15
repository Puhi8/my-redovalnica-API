const fs = require("fs")
const path = require('path')
const cors = require('cors')
const express = require("express")
const bodyParser = require('body-parser')
const PORT = 9999
const app = express()


/// DATA
// for writing to main json
const writeFileTimeoutDuration = 300000
const numberOfRequestsToWriteFileRequired = 10
let writeFileTimeout
let numberOfRequestsToWriteFile = 0
// maps
const typeMap = new Map(require("./src/typeMapArrays"))
const mainItemNameMap = new Map([
   ["grades", "OCENE"],
   ["dates", "DATUMI"]
])
// arrays
let allClassesArray = require("./src/classes")
const singleFieldValues = ["iEstimate", "endedGrade"]
// objects
const templates = require("./src/template")
const dataFieldsNeeded = require("./src/dataFieldsNeeded")
// random
let massage
let server

const getDataFor = (itemFor) => {
   return JSON.parse(
      fs.readFileSync(`./${mainItemNameMap.get(itemFor)}.json`, "utf-8", (error, data) => {
         if (error) {
            console.log(error)
            return
         }
         return data
      })
   )
}
// cashed data 
let DATA = { grades: getDataFor("grades"), dates: getDataFor("dates") }

const createClass = (className) => {
   let data = getDataFor("grades")
   let toAdd = templates.class
   toAdd.teacher = templates.teacher
   data = {
      ...data,
      [className]: toAdd
   }
   return data
}

/// server functions
function writeFileSchedule(typeOfRequest) {
   switch (typeOfRequest) {
      case "number":
         numberOfRequestsToWriteFile++
         if (numberOfRequestsToWriteFile >= numberOfRequestsToWriteFileRequired) {
            numberOfRequestsToWriteFile = 0
            writeToFile()
            clearTimeout(writeFileTimeout) // prevent the timeout from running, cause the file was written by "number" 
            break
         }
      default:
         if (writeFileTimeout) clearTimeout(writeFileTimeout)
         writeFileTimeout = setTimeout(writeToFile, writeFileTimeoutDuration)
   }
}

function stopServer(reason) {
   // stop / shutdown the server controllably
   if (server) {
      console.log("Stopping server:", !!reason ? reason : "")
      writeToFile()
      server.close((err) => {
         if (err) console.error(err)
         else console.log("Proper stop.")
      })
   }
   else console.log("Server is off")
}

/// make it work as an API
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, "dist")))
app.use(cors())
app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', '*')
   res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
   res.header("Access-Control-Allow-Headers", "Content-Type, Accept, Origin, X-Requested-With")
   if (req.url != "/STOPSERVER" && req.method == "POST") writeFileSchedule()
   next()
})

/// handle website
app.get("/", (req, res) => {
   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
})

/// handle GET
app.get("/api/grades", (req, res) => {
   console.log("GET from grades")
   res.json(DATA.grades)
})
app.get("/api/dates", (req, res) => {
   console.log("GET from dates")
   res.json(DATA.dates)
})
app.get("/api/allClasses", (req, res) => {
   console.log("GET from allClasses")
   res.json(allClassesArray)
})

/// handle POST
app.post('/api/grades', (req, res) => {
   console.log("POST")   
   massage = ""
   let data = req.body
   combineOldWithNew(data)
   if (massage) res.json({ massage: massage })
   else {
      res.status(200)
      res.json({ massage: "all good" })
   }
})

/// activate server
server = app.listen(PORT, () => {
   console.log(`Redovalnica API is on port ${PORT}`)
})

/// extra developer functions
app.get("/refreshClasses", (req, res) => {
   console.log("Refresh classes")
   allClassesArray = require("./src/classes")
})

app.get("/STOPSERVER", (req, res) => {
   console.log("Get from stop server")
   stopServer("Get request")
})


function combineOldWithNew(newData) {
   /// check if the data is valid
   // class
   let classIsProper = false
   try {
      newData.class = newData.class.toUpperCase()
   }
   catch (err) {
      massage = "Class is not proper."
      return
   }
   if(!allClassesArray.includes(newData.class)){
      massage = "Improper class."
      return
   }
   // type
   if (!dataFieldsNeeded.hasOwnProperty(newData.type)) {
      massage = "The type is not correct."
      return
   }
   // all data fields
   let hasAllNeededDataFields = true
   dataFieldsNeeded.dataSent.forEach(element => {
      if (!newData.hasOwnProperty(element)) {
         massage = ("Data sent dos not have: ", element)
         hasAllNeededDataFields = false
         return
      }
   })

   dataFieldsNeeded[newData.type].forEach(element => {
      if (!newData.data.hasOwnProperty(element)) {
         massage = ("It does not have: " + element)
         hasAllNeededDataFields = false
         return
      }
      else if (newData.data[element] == null || newData.data[element] == undefined) {
         massage = ("Invalid data for: " + element)
         hasAllNeededDataFields = false
         return
      }
   })
   if (!hasAllNeededDataFields) return


   let oldData = DATA[newData.file]

   let noChanges = false
   const myClass = newData.class
   const category = newData.data.category
   // handel future dates
   if (newData.file == "dates") {
      switch (newData.type) {
         case "delete":
            oldData[category].splice(newData.data.index, 1)
            break
         default:
            oldData[typeMap.get(newData.type)].push(newData.data)
      }
   }
   else if (newData.file == "grades") {
      // check if the class exists
      if (!oldData[myClass]) oldData = createClass(myClass)
      switch (newData.type) {
         case "delete":
            if (singleFieldValues.includes(category)) oldData[myClass][category] = null
            else oldData[myClass][category].splice(newData.data.index, 1)
            break
         case "edit":
            if (singleFieldValues.includes(category)) oldData[myClass][category] = newData.data.newData
            else {
               oldData[myClass][category][newData.data.index] = {
                  ...newData.data.newData,
                  isSecondHalf: checkIfDateIsInSecondHalf(newData.data.newData.date) || (newData.data.newData.wasFixed && checkIfDateIsInSecondHalf(newData.data.newData.dateFixed))
               }
            }
            break
         case "iEstimate":
         case "endedGrade":
            if (typeof (newData.data.grade) == "number") oldData[myClass][newData.type] = newData.data.grade
            else {
               massage = "The final grade has to be a number."
               noChanges = true
            }
            break
         case "teacher":
            oldData[myClass].teacher = newData.data
            break
         case "gradeTalkFixed":
         case "gradeWrittenFixed":
            newData.data.isSecondHalf = checkIfDateIsInSecondHalf(newData.data.dateFixed)
            let index = newData.data.indexFixed
            if (!oldData[myClass].grades[index]) {
               massage = "Grade does not exist"
               return
            }
            delete newData.data.indexFixed
            let oldGradeObject = oldData[myClass].grades[index]
            let fixGradeData = newData.data
            oldData[myClass].grades[index] = {
               ...oldGradeObject,
               ...fixGradeData,
               wasFixed: true
            }
            break
         default:
            if(typeMap.get(newData.type) == "grades") newData.data.isSecondHalf = checkIfDateIsInSecondHalf(newData.data.date)
            oldData[myClass][typeMap.get(newData.type)].push(newData.data)
      }
   }
   else massage = "Not right file."
   if (!noChanges) writeMyFileAndMakeBackup(newData.file, oldData, newData.type)
}

function writeMyFileAndMakeBackup(itemName, data, action) {
   DATA[itemName] = data
   let text = JSON.stringify(data)
   // writing to main
   writeFileSchedule("number")
   // backup writing
   let alternativeFileNumber = 0
   function writeFileAndCheck() {
      fs.writeFile(
         `backup/${createName(itemName, alternativeFileNumber, action)}.json`,
         text,
         { flag: "wx" },
         (err) => {
            if (err) {
               if (err.code === 'EEXIST') {
                  alternativeFileNumber++
                  writeFileAndCheck()
               }
               else console.error(`Error writing file: ${err.message}`)
            }
         }
      )
   }
   writeFileAndCheck()
}

function writeToFile() {
   numberOfRequestsToWriteFile = 0
   const date = getNewDate()
   fs.writeFile(
      `OCENE.json`,
      JSON.stringify(DATA.grades),
      err => {
         if (err) console.error(err)
         else console.log(`MAIN: "grades" has changed: ${date.hour}:${date.minute}:${date.seconds}`)
      }
   )
}
function getNewDate() {
   let time = new Date
   function add0IfNeeded(timeData) {
      if (timeData < 10) return `0${timeData}`
      else return timeData
   }
   return {
      seconds: add0IfNeeded(time.getSeconds()),
      minute: add0IfNeeded(time.getMinutes()),
      hour: add0IfNeeded(time.getHours()),
      day: add0IfNeeded(time.getDate()),
      month: add0IfNeeded(time.getMonth() + 1),
      year: time.getFullYear()
   }
}
function createName(fileFor, extraNumber, extraText) {
   if (!fileFor) fileFor = ""
   if (!extraNumber) extraNumber = 0
   if (!extraText) extraText = ""
   let time = getNewDate()
   let fileName = `${time.year}.${time.month}.${time.day}-${time.hour},${time.minute}-(${extraNumber})-${fileFor}-${extraText}`
   return fileName
}
function checkIfDateIsInSecondHalf(date) {
   let [d, m, y] = date.split(".")
   if ((m > 1 || d > 15) && m < 8) return true
   else return false
}