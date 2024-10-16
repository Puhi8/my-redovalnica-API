const fs = require("fs")
const filesNeeded = ["OCENE.json", "DATUMI.json", "settings.json", "serverInfo.json", "classes.json", "backup"]
const path = require("path")
const myPath = path.join(__dirname, "..", "docker")
const filesInFolder = fs.readdirSync(myPath)
const templates = require("../src/template")

const dataForFileMap = new Map([
   ["OCENE.json", {}],
   ["DATUMI.json", { "grades": [], "other": [] }],
   ["settings.json", templates.settings],
   ["classes.json", { classes: ["MAT", "TJA", "SLJ", "KEM", "BIO", "FIZ", "GEO", "ZGO", "SPO"] }],
   ["serverInfo.json", { mainFileProperlyWritten: true, lastBackupName: "" }]
])

filesNeeded.forEach(file => {
   let fileContent = "valid data"
   if (filesInFolder.includes(file)) console.log("It has: " + file + "; with: " + fileContent)
   else {
      console.log("Making default: " + file)
      const newFilePath = path.join(myPath, file)
      if (file == "backup") fs.mkdir(newFilePath, (err) => console.log(err))
      else fs.writeFileSync(newFilePath, JSON.stringify(dataForFileMap.get(file)), err => console.error(err))
   }
})