


const studentModel = require("../../models").student;

const models = require("../../models");
const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const { RESPONSE_API } = require("../../utils/response");
const {
  calculateMinutesDifference,
  calculateWaktuSelesai,
} = require("../../utils/format");
const NilaiController = require("../../models").nilai;
const BankSoalController = require("../../models").bank_soal;
const StudentModel = require("../../models").kelas_student;


const response = new RESPONSE_API();



const listReport = response.requestResponse(async (req, res) => {
  
  

  return {
    msg: "Progress Ujian tersimpan",
  };
});


module.exports = { getExam, takeExam, submitExam, progressExam };
