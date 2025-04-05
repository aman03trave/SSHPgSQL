import mongodb from '../config/mongodb.js'
import mongoose from 'mongoose';

const GrievanceSchema = new mongoose.Schema({
    image: String,
    document: String,
    grievanceId: String,
  });

  const Grievance_Media = mongoose.model('Grievance_Media', GrievanceSchema);

  export default Grievance_Media