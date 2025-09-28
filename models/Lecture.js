const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

class Lecture {
    static async create({ title, courseId, startPage, endPage }) {
        const [result] = await db.query(
            'INSERT INTO lectures (title, course_id, start_page, end_page) VALUES (?, ?, ?, ?)',
            [title, courseId, startPage, endPage]
        );
        return this.findById(result.insertId);
    }

    static async delete(id) {
        const [result] = await db.query(
            'DELETE FROM lectures WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    static async update(id, { title, courseId, startPage, endPage }) {
        const [result] = await db.query(
            'UPDATE lectures SET title = ?, course_id = ?, start_page = ?, end_page = ? WHERE id = ?',
            [title, courseId, startPage, endPage, id]
        );
        return result.affectedRows;
    }

    static async getLectureWithContent(lectureId) {
        const lecture = await this.findById(lectureId);
        if (!lecture) return null;

        const lecturePdf = await this.extractLecturePDF(lecture);

        return {
            ...lecture,
            pdf: lecturePdf
        };
    }

    static async updateHandoutInfo(id, { handoutPath, startPage, endPage }) {
        const [result] = await db.query(
            'UPDATE lectures SET handout_path = ?, start_page = ?, end_page = ? WHERE id = ?',
            [handoutPath, startPage, endPage, id]
        );
        return result.affectedRows;
    }

    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM lectures WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async getQuizAttemptCount(lectureId) {
        const [rows] = await db.query(
            "SELECT COUNT(*) AS attempt_count FROM quiz_results WHERE quiz_id = ?",
            [lectureId]
        );
        return rows.length ? rows[0].attempt_count : 0;
    }

    static async getLectureWithFullDetails(lectureId) {
        const lecture = await this.findById(lectureId);
        if (!lecture) return null;

        const questions = await this.getQuestionsWithDetails(lectureId);
        return {
            ...lecture,
            questions
        };
    }

    static async extractLecturePDF(lecture) {
        const course = await this.getCourse(lecture.course_id);
        if (!course || !course.handout_pdf) return null;
        try {
            const fileUrl = `https://drive.google.com/uc?export=download&id=${course.handout_pdf}`;
            // Fetch PDF from Google Drive
            const response = await fetch(fileUrl);
            if (!response.ok) {
                console.error("Google Drive fetch failed:", response.statusText);
                return null;
            }


            const existingPdfBytes = Buffer.from(await response.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const newPdf = await PDFDocument.create();

            // Zero-based pages
            const pageIndices = [];
            for (let i = lecture.start_page - 1; i < lecture.end_page; i++) {
                pageIndices.push(i);
            }

            const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach((page) => newPdf.addPage(page));

            // Return PDF as Buffer (not saved anywhere)
            const lecturePdfBytes = await newPdf.save();
            return lecturePdfBytes;
        } catch (err) {
            console.error("Error generating lecture PDF:", err);
            return null;
        }
    }

    static async extractLecturesPDF(start_lecture, end_lecture) {
        const course = await this.getCourse(start_lecture.course_id);
        if (!course || !course.handout_pdf) return null;
        try {
            
            const fileUrl = `https://drive.google.com/uc?export=download&id=${course.handout_pdf}`;
            // Fetch PDF from Google Drive
            const response = await fetch(fileUrl);
            if (!response.ok) {
                console.error("Google Drive fetch failed:", response.statusText);
                return null;
            }


            const existingPdfBytes = Buffer.from(await response.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const newPdf = await PDFDocument.create();

            // Zero-based pages
            const pageIndices = [];
            for (let i = start_lecture.start_page - 1; i < end_lecture.end_page; i++) {
                pageIndices.push(i);
            }

            const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach((page) => newPdf.addPage(page));

            // Return PDF as Buffer (not saved anywhere)
            const lecturePdfBytes = await newPdf.save();
            return lecturePdfBytes;
        } catch (err) {
            console.error("Error generating lecture PDF:", err);
            return null;
        }
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM lectures');
        return rows;
    }

    static async findByCourseId(courseId) {
        const [rows] = await db.query(
            'SELECT * FROM lectures WHERE course_id = ?',
            [courseId]
        );
        if (rows.length > 0) {
            return rows;
        } else {
            return [];
        }
    }

   static async getLecturesByUserCourse(userId, courseId) {
    const [rows] = await db.query(
        `
        SELECT 
            l.*,
            CASE 
                WHEN MAX((qa.correct_answers / qa.total_questions) * 100) >= 50 
                THEN 1 
                ELSE 0 
            END AS is_completed
        FROM lectures l
        LEFT JOIN quiz_attempts qa 
            ON qa.lecture_id = l.id 
            AND qa.course_id = l.course_id
            AND qa.user_id = ?
        WHERE l.course_id = ?
        GROUP BY l.id
        ORDER BY l.id
        `,
        [userId, courseId]
    );

    return rows;
}


    static async getCourse(courseId) {
        const [rows] = await db.query(
            'SELECT * FROM courses WHERE id = ?',
            [courseId]
        );
        return rows[0];
    }

    static async deleteByCourseId(courseId) {
        const [result] = await db.query(
            'DELETE FROM lectures WHERE course_id = ?',
            [courseId]
        );
        return result.affectedRows;
    }

    static async updateLectureTotalQuestions(lectureId, totalQuestions) {
        const [result] = await db.query(
            'UPDATE lectures SET total_questions = ? WHERE id = ?',
            [totalQuestions, lectureId]
        );
        return result.affectedRows;
    }

    static async getQuestionsWithDetails(lectureId) {
        // Get all questions with their options and answers
        const [questions] = await db.query(`
            SELECT 
                q.id AS question_id, 
                q.question_text, 
                q.question_type,
                q.question_image,
                a.correct_answer,
                a.max_length
            FROM questions q
            LEFT JOIN answers a ON q.id = a.question_id
            WHERE q.lecture_id = ?`,
            [lectureId]
        );

        // Get all options for these questions
        const [options] = await db.query(`
            SELECT 
                id, 
                question_id, 
                option_text, 
                option_image, 
                is_correct 
            FROM options 
            WHERE question_id IN (
                SELECT id FROM questions WHERE lecture_id = ?
            )`,
            [lectureId]
        );

        // Organize the data
        const questionsMap = new Map();

        questions.forEach(question => {
            questionsMap.set(question.question_id, {
                id: question.question_id,
                question_text: question.question_text,
                question_type: question.question_type,
                question_image: question.question_image,
                correct_answer: question.correct_answer,
                max_length: question.max_length,
                options: []
            });
        });

        options.forEach(option => {
            if (questionsMap.has(option.question_id)) {
                questionsMap.get(option.question_id).options.push({
                    id: option.id,
                    option_text: option.option_text,
                    option_image: option.option_image,
                    is_correct: option.is_correct
                });
            }
        });

        return Array.from(questionsMap.values());
    }
}

module.exports = Lecture;