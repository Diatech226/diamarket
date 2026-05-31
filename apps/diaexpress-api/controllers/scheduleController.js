const { ensureRequestIdentity } = require('../services/diaexpressAuthService');
const {
  createSchedule,
  updateSchedule,
  listSchedules,
  getAvailableSchedulesForRoute,
} = require('../src/domains/operations/application/operationsApplicationService');
const Schedule = require('../models/Schedule');

exports.createSchedule = async (req, res) => {
  try {
    const identity = ensureRequestIdentity(req);
    const schedule = await createSchedule({ input: req.body || {}, identity });
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Erreur création schedule:', error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const identity = ensureRequestIdentity(req);
    const schedule = await updateSchedule({ scheduleId: req.params.id, input: req.body || {}, identity });
    res.json(schedule);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const { origin, destination, transportType, status, active } = req.query;
    const schedules = await listSchedules({
      filters: {
        origin,
        destination,
        transportType,
        status,
        active: active === 'true' ? true : active === 'false' ? false : undefined,
      },
      options: {
        limit: req.query.limit,
        skip: req.query.skip,
      },
    });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Erreur récupération schedules', error: err.message });
  }
};

exports.getAvailableSchedulesForRoute = async (req, res) => {
  try {
    const data = await getAvailableSchedulesForRoute({
      route: {
        origin: req.query.origin,
        destination: req.query.destination,
        transportLineId: req.query.transportLineId,
      },
      packageTypeId: req.query.packageTypeId,
      requestedUnits: Number(req.query.requestedUnits || 1),
      at: req.query.at ? new Date(req.query.at) : new Date(),
    });

    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schedule supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur suppression schedule', error: err.message });
  }
};
