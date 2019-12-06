import { subDays, addDays, startOfDay, endOfDay } from 'date-fns';
import Sequelize from 'sequelize';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    const student_id = req.params.id;

    /**
     * Check if student_id exists
     */
    const student = await Student.findOne({
      where: { id: student_id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    /**
     * Get all checkins within last 7 days
     */
    const check7days = await Checkin.findAndCountAll({
      where: {
        student_id,
        created_at: {
          [Sequelize.Op.between]: [
            subDays(endOfDay(new Date()), 7),
            endOfDay(new Date()),
          ],
        },
      },
      order: ['created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    /**
     * Check if student has more than 5 checkins within last 7 days
     */
    if (check7days.count > 4) {
      return res.status(400).json({
        error: `You cannot check in more than 5 times within last 7 days! Check in after: ${startOfDay(
          addDays(check7days.rows[0].createdAt, 7)
        )}.`,
      });
    }

    const checkIn = await Checkin.create({
      student_id,
    });

    return res.json(checkIn);
  }

  async index(req, res) {
    const student_id = req.params.id;

    /**
     * Check if student_id exists
     */
    const student = await Student.findOne({
      where: { id: student_id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    const checkin = await Checkin.findAll({
      where: { student_id },
      order: ['created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.status(200).json(checkin);
  }
}

export default new CheckinController();
