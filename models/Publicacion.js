const { Schema, model } = require("mongoose");

// Esquema de la Publicación
const publicacionSchema = new Schema(
  {
    usuario: {
      type: String,
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
    comentarios: [
      {
        comentario: {
          type: String,
        //   required: [true, "El comentario es requerido."],
        },
        usuario: {
          type: String,
          required: [true, "El nombre del usuario que comentó es requerido."],
        },
        fechaComentario: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reacciones: [
      {
        tipoReaccion: {
          type: String,
          enum: ["Me gusta", "Asombroso", "Epic", "Increíble"],
        //   required: [true, "El tipo de reacción es requerido."],
        },
        usuario: {
          type: String,
          required: [true, "El nombre del usuario que reaccionó es requerido."],
        },
        fechaReaccion: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    // Añadir campos de fecha automática
    timestamps: true,
  }
);

// Modelo de la publicación
const Publicacion = model("Publicacion", publicacionSchema);

module.exports = Publicacion;
