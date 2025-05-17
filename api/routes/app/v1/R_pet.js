const { app_router, multipartMiddleware } = require("./../../../../utils/modules");
const validateRequest = require("../../../middlewares/validation");
const { userAuth } = require("../../../middlewares/auth");

const {
    addPet,
    editPet,
    deletePet,
    adoptPet,
    likeDislikePets,
    uploadPetMedia,
    removePetMedia,
    petDetails,
    petUpdatedData,
    petListing,
    guestPetListing,
} = require("../../../controller/app/v1/C_pet");

const {
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
} = require("./../../../dto/app/v1/pet_dto");

app_router.post("/add_pet", userAuth, multipartMiddleware, validateRequest(addPetDto), addPet);
app_router.post("/edit_pet", userAuth, multipartMiddleware, validateRequest(editPetDto), editPet);
app_router.post("/delete_pet", userAuth, multipartMiddleware, validateRequest(deletePetDto), deletePet);
app_router.post("/adopt_pet", userAuth, multipartMiddleware, validateRequest(adoptPetDto), adoptPet);
app_router.post("/like_dislike_pet", userAuth, multipartMiddleware, validateRequest(likeDislikePetsDto), likeDislikePets);
app_router.post("/upload_pet_media", userAuth, multipartMiddleware, validateRequest(uploadPetMediaDto), uploadPetMedia);
app_router.post("/remove_pet_media", userAuth, multipartMiddleware, validateRequest(removePetMediaDto), removePetMedia);
app_router.post("/pet_detail", userAuth, multipartMiddleware, validateRequest(petDetailsDto), petDetails);
app_router.post("/get_pet_data", userAuth, multipartMiddleware, validateRequest(petUpdatedDataDto), petUpdatedData);
app_router.post("/pet_list", userAuth, multipartMiddleware, validateRequest(petListingDto), petListing);
app_router.post("/guest_pet_list", multipartMiddleware, validateRequest(guestPetListingDto), guestPetListing);

module.exports = app_router;