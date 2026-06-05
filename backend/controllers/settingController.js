import Setting from '../models/Setting.js';
import asyncHandler from '../utils/asyncHandler.js';

const getOrCreateSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});
  return settings;
};

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json(settings);
});
