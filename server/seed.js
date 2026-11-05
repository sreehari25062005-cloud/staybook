// Creates demo accounts + a sample hotel. Run: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const ensureUser = async (name, email, password, role) =>
    (await User.findOne({ email })) || User.create({ name, email, role, password: await bcrypt.hash(password, 10) });

  const manager = await ensureUser('Demo Manager', 'manager@staybook.com', 'Manager@123', 'manager');
  await ensureUser('Demo Guest', 'guest@staybook.com', 'Guest@123', 'guest');

  if (!(await Hotel.findOne({ manager: manager._id }))) {
    const hotel = await Hotel.create({
      manager: manager._id,
      name: 'Backwater Retreat',
      location: 'Alappuzha, Kerala',
      description: 'A calm lakeside stay with houseboat views, local cuisine and warm hospitality.',
      amenities: ['WiFi', 'Pool', 'Breakfast', 'Parking', 'AC'],
      published: true,
    });
    await Room.insertMany([
      { hotel: hotel._id, type: 'Deluxe Room', pricePerNight: 3500, maxOccupancy: 2, bedType: 'King', features: ['Lake view', 'AC'], totalRooms: 5 },
      { hotel: hotel._id, type: 'Family Suite', pricePerNight: 6200, maxOccupancy: 4, bedType: '2 Queens', features: ['Balcony', 'Kitchenette'], totalRooms: 2 },
    ]);
  }

  console.log('Seeded. Manager: manager@staybook.com / Manager@123  |  Guest: guest@staybook.com / Guest@123');
  process.exit(0);
})();
