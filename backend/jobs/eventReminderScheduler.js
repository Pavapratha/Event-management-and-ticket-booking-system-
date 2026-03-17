const cron = require('node-cron');
const { createEventReminderNotifications } = require('../controllers/notificationController');

const REMINDER_CRON = process.env.EVENT_REMINDER_CRON || '0 8 * * *';
let reminderTask = null;

const runReminderJob = async () => {
  try {
    const result = await createEventReminderNotifications();
    console.log(
      `[reminders] checkedEvents=${result.checkedEvents} candidateBookings=${result.candidateBookings} notificationsCreated=${result.notificationsCreated}`
    );
  } catch (error) {
    console.error('[reminders] daily reminder job failed:', error);
  }
};

const startEventReminderScheduler = () => {
  if (reminderTask) {
    return reminderTask;
  }

  reminderTask = cron.schedule(REMINDER_CRON, runReminderJob, {
    scheduled: true,
    timezone: process.env.EVENT_REMINDER_TIMEZONE || 'UTC',
  });

  console.log(
    `[reminders] scheduler started with cron "${REMINDER_CRON}" (${process.env.EVENT_REMINDER_TIMEZONE || 'UTC'})`
  );

  if (process.env.RUN_REMINDER_JOB_ON_START === 'true') {
    setTimeout(runReminderJob, 5000);
  }

  return reminderTask;
};

module.exports = {
  startEventReminderScheduler,
  runReminderJob,
};
