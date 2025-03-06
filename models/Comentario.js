const {
    Schema,
    model
} = require("mongoose");

const comentarioSchema = new Schema({
    // Referencia a la publicación relacionada
    publicacion: {
        type: Schema.Types.ObjectId,
        ref: "Publicacion",
        required: [true, "La publicación relacionada es requerida."]
    },
    comentarios: [{
        comentario: {
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
    }, ],
    reacciones: [{
        tipoReaccion: {
            type: String,
            enum: ["Me gusta", "Asombroso", "Epic", "Increíble"],
            required: [true, "El tipo de reacción es requerido."],
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
    }, ]
}, {
    timestamps: true
});

const Comentario = model("Comentario", comentarioSchema);

module.exports = Comentario;