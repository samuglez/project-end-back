const express = require("express");
const router = express.Router();
const Comentario = require("../models/Comentario");
const Publicacion = require("../models/Publicacion");
const { isAuthenticated, isAdmin } = require("../middleware/jwt.middleware");

// Obtener todos los comentarios
router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const comentarios = await Comentario.find()
      .populate("usuario", "name email")
      .sort({ fechaComentario: -1 });

    if (comentarios.length === 0) {
      return res.status(404).json({ message: "No hay comentarios disponibles." });
    }

    res.status(200).json(comentarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los comentarios." });
  }
});

// Obtener comentarios de una publicación específica
// router.get("/publicacion/:publicacionId", isAuthenticated, async (req, res, next) => {
//   try {
//     const { publicacionId } = req.params;
    
//     const publicacion = await Comentario.findById(publicacionId);
//     if (!publicacion) {
//       return res.status(404).json({ message: "Publicación no encontrada." });
//     }

//     const comentariosIds = publicacion.comentarios;
    
//     if (!comentariosIds || comentariosIds.length === 0) {
//       return res.status(404).json({ message: "Esta publicación no tiene comentarios." });
//     }

//     const comentarios = await Comentario.find({ _id: { $in: comentariosIds } })
//       .populate("usuario", "name email")
//       .sort({ fechaComentario: -1 });

//     res.status(200).json(comentarios);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error al obtener los comentarios de la publicación." });
//   }
// });

router.get("/publicacion/:publicacionId", isAuthenticated, async (req, res, next) => {
  try {
    const { publicacionId } = req.params;
    console.log("Buscando comentarios para la publicación:", publicacionId);
    const comentarios = await Comentario.find({ publicacion: publicacionId })
      .populate("usuario", "name email")
      .sort({ fechaComentario: -1 });

    if (comentarios.length === 0) {
      return res.status(404).json({ message: "Esta publicación no tiene comentarios." });
    }

    res.status(200).json(comentarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los comentarios de la publicación." });
  }
});

// Crear un nuevo comentario en una publicación
// router.post("/publicacion/:publicacionId", isAuthenticated, async (req, res) => {
//   try {
//     const { publicacionId } = req.params;
//     const { content } = req.body;
//     const userId = req.payload._id;

//     if (!content || typeof content !== "string" || content.trim() === "") {
//       return res.status(400).json({ message: "El comentario no puede estar vacío." });
//     }

//     const publicacion = await Publicacion.findById(publicacionId);
//     if (!publicacion) {
//       return res.status(404).json({ message: "Publicación no encontrada." });
//     }

//     const nuevoComentario = new Comentario({
//       content: content.trim(),
//       usuario: userId,
//       fechaComentario: new Date(),
//     });

//     const comentarioGuardado = await nuevoComentario.save();
//     publicacion.comentarios.push(comentarioGuardado._id);
//     await publicacion.save();

//     await comentarioGuardado.populate("usuario", "name email");

//     res.status(201).json(comentarioGuardado);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error al crear el comentario." });
//   }
// });

router.post("/publicacion/:publicacionId", isAuthenticated, async (req, res) => {
  try {
    const { publicacionId } = req.params;
    const { content } = req.body;
    const userId = req.payload._id;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "El comentario no puede estar vacío." });
    }

    const publicacion = await Publicacion.findById(publicacionId);
    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada." });
    }

    const nuevoComentario = new Comentario({
      content: content.trim(),
      usuario: userId,
      publicacion: publicacionId, // Asignar la publicación al comentario
      fechaComentario: new Date(),
    });

    const comentarioGuardado = await nuevoComentario.save();
    publicacion.comentarios.push(comentarioGuardado._id); // Agregar el comentario a la publicación
    await publicacion.save();

    await comentarioGuardado.populate("usuario", "name email");

    res.status(201).json(comentarioGuardado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el comentario." });
  }
});

// Eliminar un comentario
router.delete("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.payload._id;

    const comentario = await Comentario.findById(id);
    if (!comentario) {
      return res.status(404).json({ message: "Comentario no encontrado." });
    }

    if (comentario.usuario.toString() !== userId && req.payload.rol !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para eliminar este comentario." });
    }

    const publicacion = await Publicacion.findOne({ comentarios: id });
    if (publicacion) {
      publicacion.comentarios = publicacion.comentarios.filter(
        comentarioId => comentarioId.toString() !== id
      );
      await publicacion.save();
    }

    await Comentario.findByIdAndDelete(id);

    res.status(200).json({ message: "Comentario eliminado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el comentario." });
  }
});

module.exports = router;
