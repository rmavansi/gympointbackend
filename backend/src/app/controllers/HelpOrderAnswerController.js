import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Queue from '../../lib/Queue';
import QuestionAnsweredMail from '../jobs/QuestionAnsweredMail';
import Notification from '../schemas/notification';

class HelpOrderAnswerController {
  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    /**
     * Check if helpOrder_id exists
     */
    const helpOrder = await HelpOrder.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!helpOrder) {
      return res.status(400).json({ error: 'HelpOrder does not exist.' });
    }

    const { answer } = req.body;

    const helpOrderAnswer = await helpOrder.update({
      answer,
      answer_at: new Date(),
    });

    /**
     * Notify student has a new answer
     */
    await Notification.create({
      content: `New question from ${helpOrderAnswer.student.name} was answered`,
      student: helpOrderAnswer.student_id,
    });

    await Queue.add(QuestionAnsweredMail.key, {
      helpOrderAnswer,
    });

    return res.json(helpOrderAnswer);
  }

  async index(req, res) {
    const helpOrderAnswer = await HelpOrder.findAll({
      where: { answer: null },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.status(200).json(helpOrderAnswer);
  }
}

export default new HelpOrderAnswerController();
