import mongoose from "mongoose"

const CryptoMetaSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Number,
    required: true,
  },
})

export default mongoose.models.CryptoMeta || mongoose.model("CryptoMeta", CryptoMetaSchema)

