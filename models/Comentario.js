const { Schema, model } = require("mongoose");

const comentarioSchema = new Schema({
  // Referencia a la publicación relacionada
  publicacion: {
    type: Schema.Types.ObjectId,
    ref: "Publicacion", // Referencia al modelo Publicacion
    required: [true, "La publicación es requerida."],
  },
  // Contenido del comentario
  content: {
    type: String,
    required: [true, "El comentario es requerido."],
  },
  // Referencia al usuario que hizo el comentario
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "User", // Referencia al modelo User
    required: [true, "El usuario que comentó es requerido."],
  },
  // Fecha del comentario
  fechaComentario: {
    type: Date,
    default: Date.now,
  },
});

const Comentario = model("Comentario", comentarioSchema);

module.exports = Comentario;