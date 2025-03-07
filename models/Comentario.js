const {
    Schema,
    model
} = require("mongoose");

const comentarioSchema = new Schema({
    // Referencia a la publicación relacionada
        content: {
            type: String,
            required: [true, "El comentario es requerido."],
        },
        usuario: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "El usuario que comentó es requerido."],
        },
        fechaComentario: {
            type: Date,
            default: Date.now,
        },
});

const Comentario = model("Comentario", comentarioSchema);

module.exports = Comentario;