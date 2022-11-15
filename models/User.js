const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: false,
      required: true,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    recipes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
    favorites: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
