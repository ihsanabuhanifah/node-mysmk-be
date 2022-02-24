const HalaqohModel = require("../../models").absensi_halaqoh;

const models = require("../../models");
const { Op } = require("sequelize");


const listPrestasi = async(req, res) => {
return res.send('ok')
}
const detailPrestasi = async(req, res) => {
    return res.send('ok')
    }

const deletePrestasi = async(req, res) => {
    return res.send('delete')
}

const createPrestasi = async (req, res) => {
    res.send('create')
}
const updatePrestasi = async (req, res) => {
    res.send('update')
}



module.exports = { listPrestasi };
