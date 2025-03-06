const express = require("express");
const router = express.Router();
const Comentario = require("../models/Comentario");
const Publicacion = require("../models/Publicacion");
const User = require("../models/User");
const {
    isAuthenticated
} = require("../middleware/jwt.middleware");

// Obtener todos los comentarios
router.get("/", isAuthenticated, async (req, res, next) => {
    try {
        const comentarios = await Comentario.find()
            .populate("publicacion", "nombreJuego")
            .populate("comentarios.usuario", "name")
            .populate("reacciones.usuario", "name");

        if (comentarios.length === 0)
            return res.status(404).json({
                message: "No hay comentarios."
            });

        res.status(200).json(comentarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener comentarios."
        });
    }
});

// Crear un nuevo documento de comentario para una publicación
router.post(
    "/publicacion/:publicacionId",
    isAuthenticated,
    async (req, res, next) => {
        try {
            const {
                publicacionId
            } = req.params;
            const {
                comentario
            } = req.body;
            const usuarioId = req.payload._id;

            // Verificar que la publicación existe
            const publicacionExiste = await Publicacion.findById(publicacionId);
            if (!publicacionExiste) {
                return res.status(404).json({
                    message: "Publicación no encontrada."
                });
            }

            // Verificar que el usuario existe
            const usuarioExiste = await User.findById(usuarioId);
            if (!usuarioExiste) {
                return res.status(404).json({
                    message: "Usuario no encontrado."
                });
            }

            // Crear nuevo documento de comentarios asociado a la publicación
            const nuevoComentario = new Comentario({
                publicacion: publicacionId,
                comentarios: [{
                    comentario,
                    usuario: usuarioId,
                    fechaComentario: new Date(),
                }, ],
                reacciones: [],
            });

            const comentarioGuardado = await nuevoComentario.save();

            // Actualizar la publicación para referenciar el documento de comentarios
            await Publicacion.findByIdAndUpdate(publicacionId, {
                $push: {
                    comentarios: comentarioGuardado._id
                },
            });

            // Poblar los datos del usuario para la respuesta
            const comentarioPopulado = await Comentario.findById(
                    comentarioGuardado._id
                )
                .populate("comentarios.usuario", "name")
                .populate("publicacion", "nombreJuego");

            res.status(201).json(comentarioPopulado);
        } catch (error) {
            console.error(error);
            res
                .status(500)
                .json({
                    message: "Error al crear comentario.",
                    error: error.message
                });
        }
    }
);

// Añadir un comentario a un documento de comentarios existente
router.post(
    "/:comentarioId/comentar",
    isAuthenticated,
    async (req, res, next) => {
        try {
            const {
                comentarioId
            } = req.params;
            const {
                comentario
            } = req.body;
            const usuarioId = req.payload._id;

            // Verificar que el documento de comentarios existe
            const comentarioDoc = await Comentario.findById(comentarioId);
            if (!comentarioDoc) {
                return res
                    .status(404)
                    .json({
                        message: "Documento de comentarios no encontrado."
                    });
            }

            // Verificar que el usuario existe
            const usuarioExiste = await User.findById(usuarioId);
            if (!usuarioExiste) {
                return res.status(404).json({
                    message: "Usuario no encontrado."
                });
            }

            // Añadir el nuevo comentario al array de comentarios
            const nuevoComentario = {
                comentario,
                usuario: usuarioId,
                fechaComentario: new Date(),
            };

            comentarioDoc.comentarios.push(nuevoComentario);
            await comentarioDoc.save();

            // Poblar los datos del usuario para la respuesta
            const comentarioPopulado = await Comentario.findById(comentarioId)
                .populate("comentarios.usuario", "name")
                .populate("publicacion", "nombreJuego");

            res.status(201).json(comentarioPopulado);
        } catch (error) {
            console.error(error);
            res
                .status(500)
                .json({
                    message: "Error al añadir comentario.",
                    error: error.message
                });
        }
    }
);

// Añadir una reacción a un documento de comentarios
router.post(
    "/:comentarioId/reaccionar",
    isAuthenticated,
    async (req, res, next) => {
        try {
            const {
                comentarioId
            } = req.params;
            const {
                tipoReaccion
            } = req.body;
            const usuarioId = req.payload._id;

            // Verificar que el tipo de reacción es válido
            const reaccionesValidas = ["Me gusta", "Asombroso", "Epic", "Increíble"];
            if (!reaccionesValidas.includes(tipoReaccion)) {
                return res.status(400).json({
                    message: "Tipo de reacción no válido.",
                    reaccionesValidas,
                });
            }

            // Verificar que el documento de comentarios existe
            const comentarioDoc = await Comentario.findById(comentarioId);
            if (!comentarioDoc) {
                return res
                    .status(404)
                    .json({
                        message: "Documento de comentarios no encontrado."
                    });
            }

            // Verificar que el usuario existe
            const usuarioExiste = await User.findById(usuarioId);
            if (!usuarioExiste) {
                return res.status(404).json({
                    message: "Usuario no encontrado."
                });
            }

            // Verificar si el usuario ya ha reaccionado
            const reaccionExistente = comentarioDoc.reacciones.findIndex(
                (r) => r.usuario.toString() === usuarioId.toString()
            );

            if (reaccionExistente !== -1) {
                // Si ya existe una reacción, actualizar su tipo
                comentarioDoc.reacciones[reaccionExistente].tipoReaccion = tipoReaccion;
                comentarioDoc.reacciones[reaccionExistente].fechaReaccion = new Date();
            } else {
                // Si no existe, crear una nueva reacción
                const nuevaReaccion = {
                    tipoReaccion,
                    usuario: usuarioId,
                    fechaReaccion: new Date(),
                };
                comentarioDoc.reacciones.push(nuevaReaccion);
            }

            await comentarioDoc.save();

            // Poblar los datos del usuario para la respuesta
            const comentarioPopulado = await Comentario.findById(
                comentarioId
            ).populate("reacciones.usuario", "name");

            res.status(200).json({
                message: "Reacción añadida con éxito",
                reacciones: comentarioPopulado.reacciones,
            });
        } catch (error) {
            console.error(error);
            res
                .status(500)
                .json({
                    message: "Error al añadir reacción.",
                    error: error.message
                });
        }
    }
);

// Añadir reacción directamente a una publicación
router.post(
    "/publicacion/:publicacionId/reaccion",
    isAuthenticated,
    async (req, res, next) => {
        try {
            const {
                publicacionId
            } = req.params;
            const {
                tipoReaccion
            } = req.body;
            const usuarioId = req.payload._id;

            // Verificar que el tipo de reacción es válido
            const reaccionesValidas = ["Me gusta", "Asombroso", "Epic", "Increíble"];
            if (!reaccionesValidas.includes(tipoReaccion)) {
                return res.status(400).json({
                    message: "Tipo de reacción no válido.",
                    reaccionesValidas,
                });
            }

            // Verificar que la publicación existe
            const publicacion = await Publicacion.findById(publicacionId);
            if (!publicacion) {
                return res.status(404).json({
                    message: "Publicación no encontrada."
                });
            }

            // Verificar que el usuario existe
            const usuarioExiste = await User.findById(usuarioId);
            if (!usuarioExiste) {
                return res.status(404).json({
                    message: "Usuario no encontrado."
                });
            }

            // Verificar si el usuario ya ha reaccionado
            const reaccionExistente = publicacion.reacciones.findIndex(
                (r) => r.usuario.toString() === usuarioId.toString()
            );

            if (reaccionExistente !== -1) {
                // Si ya existe una reacción, actualizar su tipo
                publicacion.reacciones[reaccionExistente].tipoReaccion = tipoReaccion;
                publicacion.reacciones[reaccionExistente].fechaReaccion = new Date();
            } else {
                // Si no existe, crear una nueva reacción
                const nuevaReaccion = {
                    tipoReaccion,
                    usuario: usuarioId,
                    fechaReaccion: new Date(),
                };
                publicacion.reacciones.push(nuevaReaccion);
            }

            await publicacion.save();

            // Poblar los datos del usuario para la respuesta
            const publicacionPopulada = await Publicacion.findById(
                publicacionId
            ).populate("reacciones.usuario", "name");

            res.status(200).json({
                message: "Reacción añadida con éxito a la publicación",
                reacciones: publicacionPopulada.reacciones,
            });
        } catch (error) {
            console.error(error);
            res
                .status(500)
                .json({
                    message: "Error al añadir reacción a la publicación.",
                    error: error.message,
                });
        }
    }
);

// Eliminar una reacción de un comentario
router.delete(
    "/:comentarioId/reaccionar",
    isAuthenticated,
    async (req, res, next) => {
        try {
            const {
                comentarioId
            } = req.params;
            const usuarioId = req.payload._id;

            // Verificar que el documento de comentarios existe
            const comentarioDoc = await Comentario.findById(comentarioId);
            if (!comentarioDoc) {
                return res
                    .status(404)
                    .json({
                        message: "Documento de comentarios no encontrado."
                    });
            }

            // Filtrar las reacciones para quitar la del usuario actual
            const reaccionesAntes = comentarioDoc.reacciones.length;
            comentarioDoc.reacciones = comentarioDoc.reacciones.filter(
                (r) => r.usuario.toString() !== usuarioId.toString()
            );

            // Verificar si se eliminó alguna reacción
            if (reaccionesAntes === comentarioDoc.reacciones.length) {
                return res
                    .status(404)
                    .json({
                        message: "No se encontró ninguna reacción del usuario."
                    });
            }

            await comentarioDoc.save();

            res.status(200).json({
                message: "Reacción eliminada con éxito",
                reacciones: comentarioDoc.reacciones,
            });
        } catch (error) {
            console.error(error);
            res
                .status(500)
                .json({
                    message: "Error al eliminar reacción.",
                    error: error.message
                });
        }
    }
);

// Eliminar una reacción de una publicación
router.delete(
    "/publicacion/:publicacionId/reaccion",
    isAuthenticated,
    async (req, res, next) => {
        try {
            const {
                publicacionId
            } = req.params;
            const usuarioId = req.payload._id;

            // Verificar que la publicación existe
            const publicacion = await Publicacion.findById(publicacionId);
            if (!publicacion) {
                return res.status(404).json({
                    message: "Publicación no encontrada."
                });
            }

            // Filtrar las reacciones para quitar la del usuario actual
            const reaccionesAntes = publicacion.reacciones.length;
            publicacion.reacciones = publicacion.reacciones.filter(
                (r) => r.usuario.toString() !== usuarioId.toString()
            );

            // Verificar si se eliminó alguna reacción
            if (reaccionesAntes === publicacion.reacciones.length) {
                return res
                    .status(404)
                    .json({
                        message: "No se encontró ninguna reacción del usuario."
                    });
            }

            await publicacion.save();

            res.status(200).json({
                message: "Reacción eliminada con éxito de la publicación",
                reacciones: publicacion.reacciones,
            });
        } catch (error) {
            console.error(error);
            res
                .status(500)
                .json({
                    message: "Error al eliminar reacción de la publicación.",
                    error: error.message,
                });
        }
    }
);

// Obtener comentarios de una publicación específica
router.get("/publicacion/:publicacionId", async (req, res, next) => {
    try {
        const {
            publicacionId
        } = req.params;

        // Verificar que la publicación existe
        const publicacion = await Publicacion.findById(publicacionId);
        if (!publicacion) {
            return res.status(404).json({
                message: "Publicación no encontrada."
            });
        }

        // Obtener todos los documentos de comentarios asociados a la publicación
        const comentarios = await Comentario.find({
                publicacion: publicacionId
            })
            .populate("comentarios.usuario", "name")
            .populate("reacciones.usuario", "name")
            .sort({
                "comentarios.fechaComentario": -1
            }); // Ordenar por comentarios más recientes

        if (comentarios.length === 0) {
            return res
                .status(404)
                .json({
                    message: "No hay comentarios para esta publicación."
                });
        }

        res.status(200).json(comentarios);
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({
                message: "Error al obtener comentarios.",
                error: error.message
            });
    }
});

// Eliminar un comentario específico del array de comentarios
router.delete(
    "/:comentarioId/comentario/:indiceComentario",
    isAuthenticated,
    async (req, res, next) => {
        try {
            const {
                comentarioId,
                indiceComentario
            } = req.params;
            const usuarioId = req.payload._id;

            // Verificar que el documento de comentarios existe
            const comentarioDoc = await Comentario.findById(comentarioId);
            if (!comentarioDoc) {
                return res
                    .status(404)
                    .json({
                        message: "Documento de comentarios no encontrado."
                    });
            }

            // Verificar que el índice es válido
            const indice = parseInt(indiceComentario);
            if (
                isNaN(indice) ||
                indice < 0 ||
                indice >= comentarioDoc.comentarios.length
            ) {
                return res
                    .status(400)
                    .json({
                        message: "Índice de comentario no válido."
                    });
            }

            // Verificar que el usuario es el autor del comentario
            if (
                comentarioDoc.comentarios[indice].usuario.toString() !==
                usuarioId.toString()
            ) {
                return res
                    .status(403)
                    .json({
                        message: "No tienes permiso para eliminar este comentario.",
                    });
            }

            // Eliminar el comentario específico
            comentarioDoc.comentarios.splice(indice, 1);

            // Si no quedan comentarios ni reacciones, eliminar el documento completo
            if (
                comentarioDoc.comentarios.length === 0 &&
                comentarioDoc.reacciones.length === 0
            ) {
                // Obtener el ID de la publicación antes de eliminar el documento
                const publicacionId = comentarioDoc.publicacion;

                await Comentario.findByIdAndDelete(comentarioId);

                // También eliminar la referencia en la publicación
                await Publicacion.findByIdAndUpdate(publicacionId, {
                    $pull: {
                        comentarios: comentarioId
                    },
                });

                return res
                    .status(200)
                    .json({
                        message: "Comentario eliminado y documento limpiado."
                    });
            }

            await comentarioDoc.save();

            res.status(200).json({
                message: "Comentario eliminado con éxito",
                comentarios: comentarioDoc.comentarios,
            });
        } catch (error) {
            console.error(error);
            res
                .status(500)
                .json({
                    message: "Error al eliminar comentario.",
                    error: error.message,
                });
        }
    }
);

module.exports = router;