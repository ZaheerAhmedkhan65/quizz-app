const Lecture = require('../models/Lecture');
const Course = require('../models/Course');
const UserCourse = require('../models/UserCourse');
const Question = require('../models/Question');
const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');
const path = require('path');

const getAll = async (req, res) => {
    try {
        const lectures = await Lecture.getAll();
        res.status(200).json(lectures);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const show = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);
        const course = await Course.findById(lecture.course_id);
        const questions = await Lecture.getQuestionsWithDetails(req.params.id);

        if(req.user && req.user.role=='admin'){
            return res.status(200).render('admin/lectures/show', {
                lecture,
                title: lecture.title,
                questions,
                course,
                user: req.user,
                courseId: req.params.course_id,
                lectureId: req.params.id,
                path: req.path,
                token: req.cookies.token
            });
        }

        res.status(200).render('public/lecture', {
            lecture,
            title: lecture.title,
            questions,
            quizzId: lecture.id,
            course,
            user: req.user || null,
            courseId: req.params.course_id,
            lectureId: req.params.id,
            path: req.path
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { title, course_id, start_page, end_page } = req.body;
        await Lecture.create({ title, courseId: course_id, startPage: start_page, endPage: end_page });
        const lectures = await Lecture.findByCourseId(course_id);
        await Course.updateTotalLectures(course_id, lectures.length);

        // Fetch total quizzes
        const totalLectures = await Course.getTotalLectures(course_id);
        if (!totalLectures) {
            return res.status(400).json({ message: "No lectures available for this course." });
        }

        // Calculate progress
        let courseProgress = (lectures.length / totalLectures) * 100;
        courseProgress = Math.min(courseProgress, 100.00); // Prevent exceeding 100%

        // Update progress in `user_courses`
        await UserCourse.updateProgress(req.user.userId, req.params.course_id, courseProgress);
        req.flash('success', 'The lecture is created successfully!');
        res.status(201).redirect('/admin/courses/' + course_id );
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const update = async (req, res) => {
    try {
        const { title, start_page, end_page } = req.body;
        const lecture = await Lecture.findById(req.params.id);
        const course_id = req.body.course_id || lecture.course_id; // Fallback to existing value
        
        await Lecture.update(req.params.id, {
            title, 
            courseId: course_id,
            startPage: start_page, 
            endPage: end_page
        });
        req.flash('success', 'The lecture is updated successfully!');
        res.status(200).redirect('/admin/courses/' + course_id);
    } catch (err) {
        res.status(500).json({ 
            message: err.message 
        });
    }
}


const deleteLecture = async (req, res) => {
    try {
        await Lecture.delete(req.params.id);
        await Question.deleteByLectureId(req.params.id);
        res.status(200).json({ message: "Lecture deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const edit = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    const courses = await Course.getAll();
    res.status(200).render('admin/lectures/edit', { lecture, title: "Edit Lecture", courses, user: req.user || null, path: req.path });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const downloadQuestionPDF = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);

        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        const course = await Course.findById(lecture.course_id);

         if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const questions = await Lecture.getQuestionsWithDetails(req.params.id);

        if (!questions) {
            return res.status(404).json({ message: 'Questions not found for this lecture.' });
        }

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();

        // Load fonts
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Set initial positions
        let yPosition = height - 50;
        const margin = 50;
        const lineHeight = 20;
        const sectionSpacing = 30;

        // Function to add watermark to a page
        const addWatermark = (page) => {
            page.drawText('VU EMPIRE', {
                x: width / 2 - 170,
                y: height / 4,
                size: 100,
                font: font,
                color: rgb(0.9, 0.9, 0.9),
                rotate: degrees(45),
                opacity: 0.8,
            });
        };

        // Add watermark to first page FIRST (so it's in the background)
        addWatermark(page);

        // Add header (this will appear on top of watermark)
        page.drawText(`${course.title} - ${lecture.title}`, {
            x: margin,
            y: yPosition,
            size: 16,
            font: fontBold,
            color: rgb(0, 0, 0),
        });

        yPosition -= 40;

        // Add questions
        for (let index = 0; index < questions.length; index++) {
            const question = questions[index];

            // Check if we need a new page
            if (yPosition < margin + 100) {
                page = pdfDoc.addPage();
                yPosition = height - 50;

                // Add watermark to new page FIRST
                addWatermark(page);

                // Add header to new page
                page.drawText(`${course.title} - ${lecture.title}`, {
                    x: margin,
                    y: yPosition,
                    size: 16,
                    font: fontBold,
                    color: rgb(0, 0, 0),
                });

                yPosition -= 40;
            }

            // Question number and text
            page.drawText(`${index + 1}. ${question.question_text}`, {
                x: margin,
                y: yPosition,
                size: 12,
                font: fontBold,
                color: rgb(0, 0, 0),
            });

            yPosition -= lineHeight;

            // Options
            for (let optIndex = 0; optIndex < question.options.length; optIndex++) {
                const option = question.options[optIndex];
                const prefix = String.fromCharCode(65 + optIndex); // A, B, C, D

                // Draw option text
                page.drawText(`   ${prefix}. ${option.option_text}`, {
                    x: margin + 20,
                    y: yPosition,
                    size: 11,
                    font: font,
                    color: option.is_correct ? rgb(0, 0.5, 0) : rgb(0, 0, 0),
                });

                // Draw checkmark for correct answers (using text that is supported)
                if (option.is_correct) {
                    // Calculate the width of the option text to position the checkmark
                    const optionText = `   ${prefix}. ${option.option_text}`;
                    const textWidth = font.widthOfTextAtSize(optionText, 11);

                    // Draw "(Correct)" instead of checkmark
                    page.drawText(' (Correct)', {
                        x: margin + 20 + textWidth,
                        y: yPosition,
                        size: 11,
                        font: font,
                        color: rgb(0, 0.5, 0),
                    });
                }

                yPosition -= lineHeight;

                // Check if we need a new page within options
                if (yPosition < margin + 30) {
                    page = pdfDoc.addPage();
                    yPosition = height - 50;

                    // Add watermark to new page FIRST
                    addWatermark(page);

                    // Add header to new page
                    page.drawText(`${course.title} - ${lecture.title}`, {
                        x: margin,
                        y: yPosition,
                        size: 16,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                    });

                    yPosition -= 40;
                }
            }


            function wrapText(text, font, size, maxWidth) {
                const words = text.split(' ');
                let lines = [];
                let currentLine = '';

                for (let word of words) {
                    const testLine = currentLine ? currentLine + ' ' + word : word;
                    const width = font.widthOfTextAtSize(testLine, size);

                    if (width > maxWidth) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                }
                if (currentLine) lines.push(currentLine);
                return lines;
            }

            function drawExplanationBox(page, text, x, y, maxWidth, font, fontBold) {
                const headerHeight = 16;
                const lineHeight = 14;
                const padding = 5;

                const wrappedLines = wrapText(text, font, 10, maxWidth - 2 * padding);
                const bodyHeight = wrappedLines.length * lineHeight + 2 * padding;
                const boxHeight = headerHeight + bodyHeight;

                // Draw box background & border
                page.drawRectangle({
                    x,
                    y: y - boxHeight,
                    width: maxWidth,
                    height: boxHeight,
                    borderColor: rgb(1, 0.8, 0),   // Yellow border
                    borderWidth: 1,
                    color: rgb(1, 1, 0.8),         // Light yellow fill for header
                });

                // Draw header
                page.drawRectangle({
                    x,
                    y: y - headerHeight,
                    width: maxWidth,
                    height: headerHeight,
                    color: rgb(1, 1, 0),           // Yellow header background
                });

                page.drawText('Explanation', {
                    x: x + padding,
                    y: y - headerHeight + 5,
                    size: 10,
                    font: fontBold,
                    color: rgb(0, 0, 0),
                });

                // Draw explanation text inside body
                let textY = y - headerHeight - padding - 10;
                for (let line of wrappedLines) {
                    page.drawText(line, {
                        x: x + padding,
                        y: textY,
                        size: 10,
                        font: font,
                        color: rgb(0.3, 0.3, 0.3),
                    });
                    textY -= lineHeight;
                }

                return boxHeight + 5; // Return height used
            }

            // Explanation if available
            if (question.explanation) {
                const rightX = margin + 320; // right side starting point
                const availableWidth = width - rightX - margin;
                // Measure explanation text width to see if it fits on the right
                const expLines = wrapText(question.explanation, font, 10, availableWidth - 10);
                const expHeight = expLines.length * 14 + 30; // Approx box height

                let usedHeight;
                if (availableWidth > 150 && expHeight < (yPosition - margin)) {
                    // Show on right side
                    usedHeight = drawExplanationBox(page, question.explanation, rightX, yPosition+80, availableWidth, font, fontBold);
                } else {
                    // Show below options
                    if (yPosition < margin + expHeight + 40) {
                        page = pdfDoc.addPage();
                        yPosition = height - 50;
                        addWatermark(page);
                        page.drawText(`${course.title} - ${lecture.title}`, {
                            x: margin,
                            y: yPosition,
                            size: 16,
                            font: fontBold,
                            color: rgb(0, 0, 0),
                        });
                        yPosition -= 40;
                    }
                    usedHeight = drawExplanationBox(page, question.explanation, margin + 20, yPosition, width - 2 * margin - 20, font, fontBold);
                    yPosition -= usedHeight;
                }
            }


            yPosition -= sectionSpacing;
        }

        // Add page numbers to all pages
        const pages = pdfDoc.getPages();
        for (let index = 0; index < pages.length; index++) {
            const currentPage = pages[index];
            currentPage.drawText(`Page ${index + 1} of ${pages.length}`, {
                x: width - 100,
                y: 30,
                size: 10,
                font: font,
                color: rgb(0.4, 0.4, 0.4),
            });
        }

        // Serialize the PDF to bytes
        const pdfBytes = await pdfDoc.save();

        // Send PDF back to client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${lecture.title}-questions.pdf"`);
        res.setHeader('Content-Length', pdfBytes.length);
        // Add this so browser JS can read the header
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        res.send(Buffer.from(pdfBytes));

    } catch (err) {
        console.error('PDF generation error:', err);
        if (!res.headersSent) {
            res.status(500).json({
                message: 'Failed to generate PDF',
                error: err.message,
            });
        }
    }
};


const downloadLecturePDF = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) {
            return res.status(404).json({ message: "Lecture not found" });
        }

        const pdfBuffer = await Lecture.extractLecturePDF(lecture);
        if (!pdfBuffer) {
            return res.status(500).json({ message: "Failed to generate lecture PDF" });
        }

        // Set headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${lecture.title}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        // Add this so browser JS can read the header
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        res.send(Buffer.from(pdfBuffer));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error generating lecture PDF" });
    }
};

const generateLecturesPdf = async (req, res) => {
    const { from_lecture_id, to_lecture_id } = req.query;
    try {
        const fromLecture = await Lecture.findById(from_lecture_id);
        const toLecture = await Lecture.findById(to_lecture_id);

        if (!fromLecture || !toLecture) {
            return res.status(404).json({ message: "Lecture not found" });
        }

        const pdfBuffer = await Lecture.extractLecturesPDF(fromLecture, toLecture);
        if (!pdfBuffer) {
            return res.status(500).json({ message: "Failed to generate lecture PDF" });
        }

        // Set headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fromLecture.title}-${toLecture.title}.pdf"`
        );
        res.setHeader('Content-Length', pdfBuffer.length);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        res.send(Buffer.from(pdfBuffer));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error generating lecture PDF" });
    }
};

module.exports = { getAll, show, create, update, deleteLecture, edit, downloadQuestionPDF, downloadLecturePDF, generateLecturesPdf  };