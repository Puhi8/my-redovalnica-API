const fs = require("fs")
const path = require("path")
const myPath = path.join(__dirname, "..", "docker")
const {writeFile} = require("fs")
const allClasses = JSON.parse(fs.readFileSync(path.join(myPath, "classes.json"), "utf-8")).classes
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