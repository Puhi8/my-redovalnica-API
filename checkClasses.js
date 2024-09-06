const {writeFile, readFileSync} = require("fs")
const allClasses = require("./src/classes")
const templates = require("./src/template")
const allData = JSON.parse(
   readFileSync(`./OCENE.json`, "utf-8", (error, data) => {
      if (error) {
         console.log(error)
         return
      }
      return data
   })
)
const courantValidClasses = Object.keys(allData)
//make new "OCENE" object
let newData
allClasses.forEach(myClass =>{
   newData = {
      ...newData,
      [myClass]: courantValidClasses.includes(myClass) ? allData[myClass] : {...templates.class, teacher: templates.teacher}
   }
})
//write to OCENE.json
writeFile(
   `OCENE.json`,
   JSON.stringify(newData),
   err => console.error(err)
)
//update API
fetch("http://localhost:9999/refreshClasses")