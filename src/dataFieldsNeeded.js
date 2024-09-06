module.exports = {
   dataSent: ["class", "file", "type", "data"],
   gradeWritten:["effective", "grade", "gradeExtra", "type", "date", "aboutTest", "wasFixed"],
   gradeTalk:["effective", "grade", "gradeExtra", "type", "date", "wasFixed"],
   gradeWrittenFixed:["indexFixed","gradeFixed", "gradeExtraFixed", "typeFixed", "dateFixed", "aboutTestFixed"],
   gradeTalkFixed:["indexFixed","gradeFixed", "gradeExtraFixed", "typeFixed", "dateFixed"],
   teacher: ["name","countsHomework", "endsByPercents", "ignoresFixedGrades", "convertSmallGrades", "convertPluses"],
   plus_minus: ["type", "date", "reason"],
   smallGrade: ["grade", "date", "reason"],
   homework: ["date"],
   delete: ["category", "index"],
   edit: ["category", "index", "newData"],
   iEstimate: ["grade"],
   endedGrade: ["grade"],
//Things to go in the calender
   futureGrade: ["class", "type", "fixing", "date", "classroom", "time", "reminder_days", "material"],
   futureThings: ["class", "type", "isGraded", "date", "time", "location", "reminder_days", "reminder_hours"]
}