import mongoose from "mongoose";

const ATRschema = new mongoose.Schema({
    atr_id: String,
    document: String,
    version: {
    type: Number,
    required: true,  // Optional: if you want it to be mandatory
  }
  
  });

  const ATR_Media = mongoose.model('ATR_Media', ATRschema);

  export default ATR_Media;