const { Schema, model } = require("mongoose");

const publicacionSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Usuario es requerido."],
    },
    fechaPublicacion: {
      type: Date,
      default: Date.now,
    },
    nombreJuego: {
      type: String,
      required: [true, "El nombre del juego es requerido."],
    },
    trofeosLogros: {
      type: [String],
      required: [true, "Se requiere al menos un trofeo o logro."],
    },
    duracion: {
      type: String,
      required: [true, "La duración para conseguir todos los logros es requerida."],
    },
    dificultad: {
      type: String,
      required: [true, "La dificultad de los logros es requerida."],
    },
    contenido: {
      type: String,
      required: [true, "El contenido de la experiencia es requerido."],
    },
    plataforma: {
      type: String,
      enum: ["PlayStation", "Xbox", "Steam"],
      required: [true, "La plataforma donde se consiguió el logro es requerida."],
    },
    // Referencias a los comentarios de la publicación
    comentarios: [{
      type: Schema.Types.ObjectId,
      ref: "Comentario"
    }],
    // Agregar reacciones directamente a la publicación
    reacciones: [
      {
        tipoReaccion: {
          type: String,
          enum: ["Me gusta", "Asombroso", "Epic", "Increíble"],
        },
        usuario: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: [true, "El usuario que reaccionó es requerido."],
        },
        fechaReaccion: {
          type: Date,
          default: Date.now,
        },
      },
    ]
  },
  {
    timestamps: true,
  }
);

const Publicacion = model("Publicacion", publicacionSchema);

module.exports = Publicacion;