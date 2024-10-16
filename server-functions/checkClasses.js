const path = require("path")
const myPath = path.join(__dirname, "..", "docker")
const { readFileSync, writeFileSync } = require("fs")
const templates = require("../src/template")
const allClasses = JSON.parse(readFileSync(path.join(myPath, "classes.json"), "utf-8")).classes

console.log("classes: " + allClasses)

let allData
try {
   allData = JSON.parse(
      readFileSync(path.join(myPath, "OCENE.json"), "utf-8", (error, data) => {
         if (error) {
            console.error("err:" + error)
            return
         }
         return data
      })
   )
}
catch (err) { allData = {} }
const courantValidClasses = Object.keys(allData)
// make new "OCENE" object
let newData
allClasses.forEach(myClass => {
   newData = {
      ...newData,
      [myClass]: courantValidClasses.includes(myClass) ? allData[myClass] : { ...templates.class, teacher: templates.teacher }
   }
})
// write to OCENE.json
writeFileSync(
   path.join(myPath, "OCENE.json"),
   JSON.stringify(newData),
   err => console.error(err)
)
