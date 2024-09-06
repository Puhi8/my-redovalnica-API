const {writeFile} = require("fs")
const allClasses = require("./src/classes")
const templates = require("./src/template")

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
   `OCENE.json`,
   JSON.stringify(contents),
   err => console.error(err)
)