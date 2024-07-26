const studentModel = require("../../models").student;

const models = require("../../models");
const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const { RESPONSE_API } = require("../../utils/response");
const NilaiController = require("../../models").nilai;
const BankSoalController = require("../../models").bank_soal;
const StudentModel = require("../../models").kelas_student;

const response = new RESPONSE_API();

const getExam = response.requestResponse(async (req, res) => {
  const { page, pageSize } = req.query;
  const exam = await NilaiController.findAndCountAll({
    ...(pageSize !== undefined && { limit: pageSize }),
    ...(page !== undefined && { offset: page }),
   where : {
    student_id: req.student_id
   }
  });

  
  return {
    msg: "Data berhasil di update",
    data: exam,

    page: req.page,
    pageSize: pageSize,
  };
});

module.exports = { getExam };
