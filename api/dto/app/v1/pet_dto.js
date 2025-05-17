const { joi } = require("./../../../../utils/modules");

const addPetDto = joi.object().keys({
    pet_name: joi.string().allow().label("Pet name"),
    pet_type: joi.string().allow().label("Pet type"),
    pet_breed: joi.string().allow().label("Pet breed"),
    location: joi.string().allow().label("Location"),
    address: joi.string().allow().label("Address"),
    gender: joi.string().allow().label("Gender"),
    price: joi.string().allow().label("Price"),
    description: joi.string().allow().label("Description"),
    ln: joi.string().allow().label("Ln"),
});

const editPetDto = joi.object().keys({
    pet_id: joi.string().allow().label("Pet id"),
    pet_name: joi.string().allow().label("Pet name"),
    pet_type: joi.string().allow().label("Pet type"),
    pet_breed: joi.string().allow().label("Pet breed"),
    location: joi.string().allow().label("Location"),
    address: joi.string().allow().label("Address"),
    gender: joi.string().allow().label("Gender"),
    price: joi.string().allow().label("Price"),
    description: joi.string().allow().label("Description"),
    ln: joi.string().allow().label("Ln"),
});

const deletePetDto = joi.object().keys({
    pet_id: joi.string().allow().label("Pet id"),
    ln: joi.string().allow().label("Ln"),
});

const adoptPetDto = joi.object().keys({
    pet_id: joi.string().allow().label("Pet id"),
    is_adopted: joi.string().allow().label("Is adopted"),
    ln: joi.string().allow().label("Ln"),
});

const likeDislikePetsDto = joi.object().keys({
    pet_id: joi.string().allow().label("Pet id"),
    is_like: joi.string().allow().label("Is like"),
    ln: joi.string().allow().label("Ln"),
});

const uploadPetMediaDto = joi.object().keys({
    pet_id: joi.string().allow().label("Pet id"),
    album_type: joi.string().allow().label("Album type"),
    ln: joi.string().allow().label("Ln"),
});

const removePetMediaDto = joi.object().keys({
    album_id: joi.string().allow().label("Album id"),
    ln: joi.string().allow().label("Ln"),
});

const petDetailsDto = joi.object().keys({
    pet_id: joi.string().allow().label("Pet id"),
    ln: joi.string().allow().label("Ln"),
});

const petUpdatedDataDto = joi.object().keys({
    pet_id: joi.string().allow().label("Pet id"),
    ln: joi.string().allow().label("Ln"),
});

const petListingDto = joi.object().keys({
    search: joi.string().allow().label("Search"),
    pet_type: joi.string().allow().label("Pet type"),
    pet_breed: joi.string().allow().label("Pet breed"),
    gender: joi.string().allow().label("gender"),
    page: joi.allow().label("Page"),
    limit: joi.allow().label("Limit"),
    lat: joi.allow().label("Lat"),
    long: joi.allow().label("Long"),
    ln: joi.string().allow().label("Ln"),
});

const guestPetListingDto = joi.object().keys({
    search: joi.string().allow().label("Search"),
    pet_type: joi.string().allow().label("Pet type"),
    pet_breed: joi.string().allow().label("Pet breed"),
    gender: joi.string().allow().label("gender"),
    page: joi.allow().label("Page"),
    limit: joi.allow().label("Limit"),
    lat: joi.allow().label("Lat"),
    long: joi.allow().label("Long"),
    ln: joi.string().allow().label("Ln"),
});

module.exports = {
    addPetDto,
    editPetDto,
    deletePetDto,
    adoptPetDto,
    likeDislikePetsDto,
    uploadPetMediaDto,
    removePetMediaDto,
    petDetailsDto,
    petUpdatedDataDto,
    petListingDto,
    guestPetListingDto,
};