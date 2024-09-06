const express = require("express")
const fs = require("fs")
const bodyParser = require('body-parser')
const templates = require("./src/template")
const dataFieldsNeeded = require("./src/dataFieldsNeeded")
const PORT = 9999
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//DATA
let massage
const typeMap = new Map(require("./src/typeMapArrays"))
let allClassesArray = require("./src/classes")
const mainItemNameMap = new Map([
   ["grades", "OCENE"],
   ["dates", "DATUMI"]
])

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

//make it work as an API
app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', '*')
   res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
   res.header("Access-Control-Allow-Headers", "Content-Type, Accept, Origin, X-Requested-With")
   next()
})

//handle GET
app.get("/grades", (req, res) => {
   console.log("GET from grades")
   res.json(getDataFor("grades"))
})
app.get("/dates", (req, res) => {
   console.log("GET from dates")
   res.json(getDataFor("dates"))
})
app.get("/allClasses", (req, res) => {
   console.log("GET from allClasses")
   res.json(allClassesArray)
})

//handle POST
app.post('/grades', (req, res) => {
   massage = ""
   let data = req.body
   combineOldWithNew(data)
   if(massage){
      res.json({massage: massage})
   }
   else{
      res.status(200)
      res.json({massage: "all good"})
   }
})
//activate server
app.listen(PORT, () => {
   console.log(`Redovalnica API is on port ${PORT}`)
})

app.get("/refreshClasses", (req, res) => {
   console.log("Refresh classes")
   allClassesArray = require("./src/classes")
})

function combineOldWithNew(newData) {
   ///check if the data is valid
   //class
   let classIsProper = false
   try {
      newData.class = newData.class.toUpperCase()
   }
   catch (err) {
      massage = "Class is not proper."
      return
   }

   allClassesArray.forEach((element) => {
      if (newData.class == element) {
         classIsProper = true
         return
      }
   })
   if (!classIsProper) {
      massage = "Improper class."
      return
   }
   //type
   if (!dataFieldsNeeded.hasOwnProperty(newData.type)) {
      massage = "The type is not correct."
      return
   }
   //all data fields
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
      else if(newData.data[element] == null || newData.data[element] == undefined) {
         massage = ("Invalid data for: " + element)
         hasAllNeededDataFields = false
         return
      }
   })
   if (!hasAllNeededDataFields) return


   let oldData = getDataFor(newData.file)

   let noChanges = false
   //handel future dates
   if (newData.file == "dates") {
      switch (newData.type) {
         case "delete":
            oldData[newData.data.category].splice(newData.data.index, 1)
            break
         default:
            oldData[typeMap.get(newData.type)].push(newData.data)
      }
   }
   else if (newData.file == "grades") {
      //check if the class exists
      if (!oldData[newData.class]) oldData = createClass(newData.class)
      switch (newData.type) {
         case "delete":
            if (newData.data.category == "iEstimate" || newData.data.category == "endedGrade") oldData[newData.class][newData.data.category] = null
            else oldData[newData.class][newData.data.category].splice(newData.data.index, 1)
            break
         case "edit":
            if (newData.data.category == "iEstimate" || newData.data.category == "endedGrade") oldData[newData.class][newData.data.category] = newData.data.newData
            else oldData[newData.class][newData.data.category][newData.data.index] = newData.data.newData
            break
         case "iEstimate":
         case "endedGrade":
            if (typeof (newData.data.grade) == "number") oldData[newData.class][newData.type] = newData.data.grade
            else {
               massage = "The final grade has to be a number."
               noChanges = true
            }
            break
         case "teacher":
            oldData[newData.class].teacher = newData.data
            break
         case "gradeTalkFixed":
         case "gradeWrittenFixed":
            newData.data.isSecondHalf = checkIfDateIsInSecondHalf(newData.data.dateFixed)
            let index = newData.data.indexFixed
            if (!oldData[newData.class].grades[index]) {
               massage = "Grade does not exist"
               return
            }
            delete newData.data.indexFixed
            let oldGradeObject = oldData[newData.class].grades[index]
            let fixGradeData = newData.data
            oldData[newData.class].grades[index] = {
               ...oldGradeObject,
               ...fixGradeData,
               wasFixed: true
            }
            break
         default:
            newData.data.isSecondHalf = checkIfDateIsInSecondHalf(newData.data.date)
            oldData[newData.class][typeMap.get(newData.type)].push(newData.data)
      }
   }
   else massage = "Not right file."
   if (!noChanges) writeMyFIleAndMakeBackup(newData.file, oldData, newData.type)
}

function writeMyFIleAndMakeBackup(itemName, data, action) {
   let text = JSON.stringify(data)
   //main writing
   fs.writeFile(
      `${mainItemNameMap.get(itemName)}.json`,
      text,
      err => {
         if (err) console.error(err)
         else console.log(`MAIN: "${itemName}" has changed.`)
      }
   )
   //backup writing
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

function getNewDate() {
   let time = new Date
   function add0IfNeeded(timeData) {
      if (timeData < 10) return `0${timeData}`
      else return timeData
   }
   return {
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
   let [d,m,y] = date.split(".")
   if ((m > 1 || d > 15) && m < 8) return true
   else return false
}