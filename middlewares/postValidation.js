const { body } = require("express-validator");

const postInsertValidation = () => {
  return [
    body("title")
      .not()
      .equals("undefined")
      .withMessage("A descrição é obrigatória.")
      .isString()
      .withMessage("A descrição é obrigatória.")
      .isLength({ min: 2 })
      .withMessage("A descrição precisa ter no mínimo 2 caracteres."),
    body("image").custom((value, { req }) => {
        if(!req.file) {
            throw new Error("A imagem é obrigatória.")
        }
        return true
    })
  ];
};

const postUpdateValidation = () => {
  return [
    body("title")
    .optional()
    .isString()
    .withMessage("A descrição é obrigatória")
    .isLength({ min: 3 })
    .withMessage("O nome precisa ter no mínimo 3 caracteres."),
  ]
}

const commentValidation = () => {
  return [
    body("comment").isString().withMessage("O comentário é obrigatório"),
  ]
}

module.exports = {
    postInsertValidation,
    postUpdateValidation,
    commentValidation,
}