const path = require("path")
const myPath = path.join(__dirname, "..", "docker")
const {writeFile} = require("fs")
const allClasses = require(path.join(myPath, "classes"))
const templates = require("../src/template")

let contents = {}
allClasses.forEach(myClass=>{
   contents = {
      ...contents,
      [myClass]:{
         ...templates.class,
         "teacher": templates.teacher
      }
   }
})
writeFile(
   `../docker.OCENE.json`,
   JSON.stringify(contents),
   err => console.error(err)
)