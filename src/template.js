let aboutTestObject = {
   "allPoints": null,
   "getPoints": null,
   "percent": null
}
module.exports = {
   aboutTest: {
      "allPoints": null,
      "getPoints": null,
      "percent": null
   },
   dataSent: {
      "class": "",
      "file": "",
      "type": "",
      "data": {}
   },
   settingsSent:{
      "type": "settingsChange",
      "dataChanged": "",
      "forMobile": false,
      "data": {}
   },
   class: {
      "iEstimate": null,
      "endedGrade": null,
      "teacher": {},
      "grades": [],
      "plus_minus": [],
      "smallGrade": [],
      "homework": []
   },
   teacher: {
      "name": "",
      "countsHomework": null,
      "endsByPercents": null,
      "ignoresFixedGrades": null,
      "convertSmallGrades": null,
      "convertPluses": null
   },
   gradeWritten: {
      "effective": null,
      "grade": null,
      "gradeExtra": 0,
      "type": "",
      "date": "",
      "aboutTest": aboutTestObject,
      "wasFixed": false
   },
   gradeTalk: {
      "effective": null,
      "grade": null,
      "gradeExtra": 0,
      "type": "",
      "date": "",
      "wasFixed": false
   },
   gradeWrittenFixed: {
      "indexFixed": null,
      "gradeFixed": null,
      "gradeExtraFixed": 0,
      "typeFixed": "",
      "dateFixed": "",
      "aboutTestFixed": aboutTestObject
   },
   gradeTalkFixed: {
      "indexFixed": null,
      "gradeFixed": null,
      "gradeExtraFixed": 0,
      "typeFixed": "",
      "dateFixed": ""
   },
   plus_minus: {
      "type": "",
      "date": "",
      "reason": ""
   },
   smallGrade: {
      "grade": null,
      "date": "",
      "reason": ""
   },
   homework: {
      "date": ""
   },
   delete: {
      "category": "",
      "index": null
   },
   edit: {
      "category": "",
      "index": null,
      "newData": null
   },
   iEstimate: {
      "grade": null
   },
   endedGrade: {
      "grade": null
   },
   futureGrade: {
      "class": "",
      "type": "",
      "fixing": null,
      "date": "",
      "classroom": "",
      "time": "",
      "reminder_days": null,
      "material": ""
   },
   futureThings: {
      "class": "",
      "type": "",
      "isGraded": null,
      "date": "",
      "time": "",
      "location": "",
      "reminder_days": null,
      "reminder_hours": null
   },
   settings: {
      displayNavbar: {
         "dates": true,
         "teachers": true,
         "final": true
      },
      displayGrades: {
         "class": true,
         "teacherName": true,
         "homework": true,
         "smallGrades": true,
         "plusMinus": true,
         "grades": true,
         "gradesSingle": false,
         "finalGrade": true,
         "computerEstimation": true,
         "estimation": true,
         "fixing": true
      },
      displayTeacher: {
         "name": true,
         "class": true,
         "homework": true,
         "ignoresFixedGrades": true,
         "smallGrades": true,
         "plusMinus": true,
         "percent": true
      }
   }
}