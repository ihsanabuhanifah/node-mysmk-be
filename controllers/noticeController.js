var express = require('express');
const noticeModel = require("../models").notice;
const validator = require('fastest-validator');
const v = new validator();
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getNotice(req, res) {
    try {
        let notice = await noticeModel.findAll({
            order: [["id", "desc"]]
        });

        return res.json({
            status: 200,
            message: "Success Show Notice",
            count: notice.length,
            data: notice
        });
    } catch (error) {
        return res.json({
            status: 422,
            message: "Gagal Mendapatkan data"
        });
    }
}

async function getSingleNotice(req, res) {
    try {
        let notice = await noticeModel.findOne({
            where: { id: req.params.id }
        });

        if (!notice) return res.status(404).json({ message: "data tidak ditemukan" });

        return res.json({
            status: 200,
            message: "Success Show Single Data Notice",
            data: notice
        });
    } catch (error) {
        return res.json({
            status: 422,
            message: "Gagal Mendapatkan data"
        });
    }
}

async function saveNotice(req, res) {
    const schema = {
        judul_notice: "string",
        tanggal_pengumuman: "string",
        isi_notice: "string"
    };
    const validate = v.validate(req.body, schema);
    if (validate.length) {
        return res.status(400).json(validate);
    }

    try {
        let body = req.body;

        const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
            folder: "/notice",
        });

        body.gambar_notice = secure_url;
        const newNotice = await noticeModel.create(body);

        if (newNotice) {
            return res.status(201).json({
                status: 201,
                message: "Success Create Notice",
                data: newNotice
            });
        } else {
            return res.status(401).json({ status: 401, message: "Gagal Create Notice" });
        }
    } catch (error) {
        return res.json({
            status: 422,
            message: "Gagal Menyimpan data"
        });
    }
}

async function updateNotice(req, res) {
    const schema = {
        judul_notice: "string",
        tanggal_pengumuman: "string",
        isi_notice: "string"
    };
    const validate = v.validate(req.body, schema);
    if (validate.length) {
        return res.status(400).json(validate);
    }

    try {
        let body = req.body;
        const { id } = req.params;
        const data = await noticeModel.findOne({
            where: { id: id }
        });
        if (!data) return res.status(404).json({ message: "data tidak ditemukan" });

        if (req.file?.path === undefined) {
            body.gambar_notice = data.gambar_notice;
        } else {
            const { secure_url } = await cloudinary.uploader.upload(req.file.path);

            body.gambar_notice = secure_url;
        }

        const editNotice = await noticeModel.update(body, { where: { id: id } });

        if (editNotice) {
            return res.status(201).json({
                status: 200,
                message: "Success update Notice"
            });
        } else {
            return res.status(401).json({ status: 401, message: "Gagal update Notice" });
        }
    } catch (error) {
        return res.json({
            status: 422,
            message: "Gagal Menyimpan data"
        });
    }
}

async function deleteNotice(req, res) {
    try {
        const data = await noticeModel.findOne({ where: { id: req.params.id } });
        if (!data) return res.status(404).json({ message: "data tidak ditemukan" });
        const deleteNotice = await noticeModel.destroy({ where: { id: req.params.id } });

        return res.json({
            status: 200,
            message: "Success Delete Notice"
        });
    } catch (er) {
        console.log(er);
        return res.status(442).json({ er });
    }
}

module.exports = { getNotice, getSingleNotice, saveNotice, updateNotice, deleteNotice };