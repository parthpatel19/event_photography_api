const { i18n } = require("../../../../utils/modules");

const { pets, pet_albums, pet_likes } = require("../../../models/index");

const { errorRes, successRes, multiSuccessRes } = require("../../../../utils/response_functions");

const { findPet, findPetLike, escapeRegex, objectId, findUsersPet, findPetAlbums, findPetAlbumById } = require("../../../../utils/user_function");

const {
    uploadMediaIntoS3Bucket,
    removeMediaFromS3Bucket,
} = require('./../../../../utils/bucket_manager');

const addPet = async (req, res) => {
    try {
        const user_id = req.user._id;

        const {
            pet_name,
            pet_type,
            pet_breed,
            location,
            address,
            gender,
            price,
            description,
            ln
        } = req.body;

        i18n.setLocale(req, ln);

        const insert_data = {
            user_id: user_id,
            pet_name: pet_name,
            pet_type: pet_type,
            pet_breed: pet_breed,
            address: address,
            gender: gender,
            price: price,
            description: description,
        }

        if (location) {
            const location_json_parse = JSON.parse(location);
            insert_data.location = location_json_parse;
        }

        const newPet = await pets.create(insert_data);

        return successRes(res, res.__("The pet has been successfully added."), newPet);
    } catch (error) {
        console.log("Error:", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const editPet = async (req, res) => {
    try {
        const user_id = req.user._id;

        const {
            pet_id,
            pet_name,
            pet_type,
            pet_breed,
            location,
            address,
            gender,
            price,
            description,
            ln
        } = req.body;

        i18n.setLocale(req, ln);

        const find_pet = await findPet(pet_id);

        if (!find_pet) {
            return errorRes(res, res.__("Pet not found"));
        }

        const find_users_pet = await findUsersPet(user_id, pet_id);

        if (!find_users_pet) {
            return errorRes(res, res.__("You don't have permission to edit this pet."));
        }

        const updated_data = {
            pet_name: pet_name,
            pet_type: pet_type,
            pet_breed: pet_breed,
            address: address,
            gender: gender,
            price: price,
            description: description,
        }

        if (location) {
            const location_json_parse = JSON.parse(location);
            updated_data.location = location_json_parse;
        }

        await pets.updateOne(
            {
                _id: pet_id
            },
            {
                $set: updated_data
            }
        );

        const updated_pet = await findPet(pet_id);

        return successRes(res, res.__("The pet has been successfully updated."), updated_pet);
    } catch (error) {
        console.log("Error:", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const deletePet = async (req, res) => {
    try {
        const user_id = req.user._id;

        const {
            pet_id,
            ln
        } = req.body;

        i18n.setLocale(req, ln);

        const find_pet = await findPet(pet_id);

        if (!find_pet) {
            return errorRes(res, res.__("Pet not found"));
        }

        const find_users_pet = await findUsersPet(user_id, pet_id);

        if (!find_users_pet) {
            return errorRes(res, res.__("You don't have permission to delete this pet."));
        }

        const find_all_pet_albums = await findPetAlbums(user_id, pet_id);

        for (const element of find_all_pet_albums) {
            if (element.album_type == "video") {
                await removeMediaFromS3Bucket(element.album_path);
                await removeMediaFromS3Bucket(element.album_thumbnail);
            } else {
                await removeMediaFromS3Bucket(element.album_path);
            }
        }

        await pets.updateOne(
            {
                _id: pet_id
            },
            {
                $set: { is_deleted: true }
            }
        );

        await pet_likes.deleteMany({ pet_id: pet_id });

        return successRes(res, res.__("The pet has been successfully deleted."), []);
    } catch (error) {
        console.log("Error:", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const adoptPet = async (req, res) => {
    try {
        const user_id = req.user._id;

        const {
            pet_id,
            is_adopted,
            ln
        } = req.body;

        i18n.setLocale(req, ln);

        const find_pet = await findPet(pet_id);

        if (!find_pet) {
            return errorRes(res, res.__("Pet not found"));
        }

        const find_users_pet = await findUsersPet(user_id, pet_id);

        if (!find_users_pet) {
            return errorRes(res, res.__("You don't have permission to modify this pet."));
        }

        if (is_adopted == true || is_adopted == "true") {
            if (find_pet.is_adopted == true || find_pet.is_adopted == "true") {
                return successRes(res, res.__("The pet has already been marked as adopted."), []);
            } else {
                await pets.updateOne(
                    {
                        _id: pet_id
                    },
                    {
                        $set: { is_adopted: true }
                    }
                );

                return successRes(res, res.__("The pet has been successfully marked as adopted."), []);
            }
        } else {
            if (find_pet.is_adopted == false || find_pet.is_adopted == "false") {
                return successRes(res, res.__("The pet is already marked as available for adoption."), []);
            } else {
                await pets.updateOne(
                    {
                        _id: pet_id
                    },
                    {
                        $set: { is_adopted: false }
                    }
                );

                return successRes(res, res.__("The pet has been successfully marked as available for adoption."), []);
            }
        }
    } catch (error) {
        console.log("Error:", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const likeDislikePets = async (req, res) => {
    try {
        const user_id = req.user._id;

        const { pet_id, is_like, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_pet = await findPet(pet_id);

        if (!find_pet) {
            return errorRes(res, res.__("Pet not found"));
        }

        if (is_like == true || is_like == "true") {
            const find_like = await findPetLike(user_id, pet_id);

            if (find_like) {
                return successRes(res, res.__("Pet liked successfully."), []);
            } else {
                await pet_likes.create({ user_id: user_id, pet_id: pet_id });

                return successRes(res, res.__("Pet liked successfully."), []);
            }
        } else {
            await pet_likes.deleteOne({ user_id: user_id, pet_id: pet_id });

            return successRes(res, res.__("Pet disliked successfully."), []);
        }
    } catch (error) {
        console.error(error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const uploadPetMedia = async (req, res) => {
    try {
        const user_id = req.user._id;

        const { pet_id, album_type, ln } = req.body;
        const { album, thumbnail } = req.files;
        i18n.setLocale(req, ln);

        const folder_name = "pet_media";
        const content_type = album.type;

        const res_upload_file = await uploadMediaIntoS3Bucket(album, folder_name, content_type);

        if (res_upload_file.status) {

            if (thumbnail) {
                const folder_name_thumbnail = "video_thumbnail";
                const content_type_thumbnail = thumbnail.type;

                const res_upload_thumbnail_file = await uploadMediaIntoS3Bucket(thumbnail, folder_name_thumbnail, content_type_thumbnail);

                if (res_upload_thumbnail_file.status) {
                    const user_image_path = `${folder_name}/` + res_upload_file.file_name;
                    const thumbnail_image_path = `${folder_name_thumbnail}/` + res_upload_thumbnail_file.file_name;

                    const fileData = {
                        user_id: user_id,
                        pet_id: pet_id,
                        album_type: album_type,
                        album_thumbnail: thumbnail_image_path,
                        album_path: user_image_path
                    };

                    const add_albums = await pet_albums.create(fileData);

                    add_albums.album_path = process.env.BUCKET_URL + add_albums.album_path;
                    add_albums.album_thumbnail = process.env.BUCKET_URL + add_albums.album_thumbnail;

                    return successRes(res, res.__("Pet media uploaded successfully"), add_albums);
                } else {
                    return errorRes(res, res.__("User thumbnail media upload failed"));
                }
            } else {
                const user_image_path = `${folder_name}/` + res_upload_file.file_name;

                const fileData = {
                    user_id: user_id,
                    pet_id: pet_id,
                    album_type: album_type,
                    album_thumbnail: null,
                    album_path: user_image_path
                };

                const add_albums = await pet_albums.create(fileData);

                add_albums.album_path = process.env.BUCKET_URL + add_albums.album_path;

                return successRes(res, res.__("User media uploaded successfully"), add_albums);
            }
        } else {
            return errorRes(res, res.__("User media upload failed"));
        }
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }

};

const removePetMedia = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { album_id, ln } = req.body;
        i18n.setLocale(req, ln);

        const userAlbum = await findPetAlbumById(album_id, user_id);

        if (!userAlbum) {
            return errorRes(res, res.__("Album not found"));
        } else {
            const res_remove_file = await removeMediaFromS3Bucket(userAlbum.album_path);
            if (userAlbum.album_type == "video") {
                await removeMediaFromS3Bucket(userAlbum.album_thumbnail);
            }

            if (res_remove_file.status) {
                await pet_albums.deleteOne({
                    _id: album_id,
                });

                return successRes(res, res.__("Media removed successfully"), []);
            } else {
                return errorRes(res, res.__("Failed to remove user media"));
            }
        }
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const petDetails = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { pet_id, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_pet = await findPet(pet_id);

        if (!find_pet) {
            return errorRes(res, res.__("Pet not found"));
        }

        const petObjectId = await objectId(pet_id);

        const pet_detail = await pets.aggregate([
            {
                $match: {
                    _id: petObjectId,
                    is_adopted: false,
                    is_deleted: false,
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_details",
                },
            },
            {
                $unwind: {
                    path: "$user_details",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "user_albums",
                    let: { localId: "$user_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$localId"] },
                                        { $eq: ["$album_type", "image"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "user_media",
                }
            },
            {
                $lookup: {
                    from: "pet_likes",
                    let: { localId: "$_id", userId: user_id },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$userId"] },
                                        { $eq: ["$pet_id", "$$localId"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "pet_like",
                }
            },
            {
                $lookup: {
                    from: "pet_albums",
                    let: {
                        petId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$pet_id", "$$petId"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "pet_album"
                }
            },
            {
                $addFields: {
                    is_user_liked: {
                        $cond: { if: { $gt: [{ $size: '$pet_like' }, 0] }, then: true, else: false }
                    },
                    user_profile: {
                        $cond: {
                            if: { $gt: [{ $size: "$user_media" }, 0] },
                            then: { $concat: [process.env.BUCKET_URL, { $arrayElemAt: ["$user_media.album_path", 0] }] },
                            else: null
                        }
                    },
                    pet_media: {
                        $map: {
                            input: "$pet_album",
                            as: "media",
                            in: {
                                _id: "$$media._id",
                                album_type: "$$media.album_type",
                                album_path: {
                                    $concat: [
                                        process.env.BUCKET_URL,
                                        "$$media.album_path"
                                    ]
                                },
                                album_thumbnail: {
                                    $cond: {
                                        if: { $eq: ["$$media.album_thumbnail", null] },
                                        then: null,
                                        else: {
                                            $concat: [
                                                process.env.BUCKET_URL,
                                                "$$media.album_thumbnail"
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    pet_name: 1,
                    pet_type: 1,
                    pet_breed: 1,
                    location: 1,
                    address: 1,
                    gender: 1,
                    price: 1,
                    description: 1,
                    is_adopted: 1,
                    is_deleted: 1,
                    is_user_liked: 1,
                    pet_media: 1,
                    user_profile: 1,
                    full_name: "$user_details.full_name",
                }
            }
        ]);

        return successRes(res, res.__("Pet detail get successfully."), pet_detail);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const petUpdatedData = async (req, res) => {
    try {
        const { pet_id, ln } = req.body;
        i18n.setLocale(req, ln);

        const petObjectId = await objectId(pet_id);

        const pet_detail = await pets.aggregate([
            {
                $match: {
                    _id: petObjectId,
                    is_adopted: false,
                    is_deleted: false,
                }
            },
            {
                $lookup: {
                    from: "pet_albums",
                    let: {
                        petId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$pet_id", "$$petId"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "pet_album"
                }
            },
            {
                $addFields: {
                    pet_media: {
                        $map: {
                            input: "$pet_album",
                            as: "media",
                            in: {
                                _id: "$$media._id",
                                album_type: "$$media.album_type",
                                album_path: {
                                    $concat: [
                                        process.env.BUCKET_URL,
                                        "$$media.album_path"
                                    ]
                                },
                                album_thumbnail: {
                                    $cond: {
                                        if: { $eq: ["$$media.album_thumbnail", null] },
                                        then: null,
                                        else: {
                                            $concat: [
                                                process.env.BUCKET_URL,
                                                "$$media.album_thumbnail"
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    pet_name: 1,
                    pet_type: 1,
                    pet_breed: 1,
                    location: 1,
                    address: 1,
                    gender: 1,
                    price: 1,
                    description: 1,
                    is_adopted: 1,
                    is_deleted: 1,
                    pet_media: 1,
                }
            }
        ]);

        return successRes(res, res.__("Successfully updated pet data"), pet_detail);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const petListing = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { search = "", pet_type, pet_breed, gender, page = 1, limit = 10, lat, long, miles_distance = 100, ln } = req.body;
        i18n.setLocale(req, ln);

        const escapedSearch = search ? await escapeRegex(search) : null;

        const query = {
            is_deleted: false,
            is_adopted: false,
            user_id: { $ne: user_id },
        }

        if (lat && long) {
            const earthRadiusInMiles = 3963.2;
            const distanceInMiles = parseInt(miles_distance);

            const lat1 = parseFloat(lat);
            const long1 = parseFloat(long);

            const radians = distanceInMiles / earthRadiusInMiles;

            const minLat = lat1 - radians * (180 / Math.PI);
            const maxLat = lat1 + radians * (180 / Math.PI);
            const minLong =
                long1 - (radians * (180 / Math.PI)) / Math.cos((lat1 * Math.PI) / 180);
            const maxLong =
                long1 + (radians * (180 / Math.PI)) / Math.cos((lat1 * Math.PI) / 180);

            query.location = {
                $geoWithin: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: [
                            // [
                            //     [minLat, minLong],
                            //     [minLat, maxLong],
                            //     [maxLat, maxLong],
                            //     [maxLat, minLong],
                            //     [minLat, minLong],
                            // ],
                            [
                                [minLong, minLat],
                                [maxLong, minLat],
                                [maxLong, maxLat],
                                [minLong, maxLat],
                                [minLong, minLat],
                            ],
                        ],
                    },
                },
            }
        }

        let petType = [];
        let petBreed = [];
        let petGender = [];

        if (pet_type) {
            petType = JSON.parse(pet_type);
            query.pet_type = { $in: petType };
        }

        if (pet_breed) {
            petBreed = JSON.parse(pet_breed);
            query.pet_breed = { $in: petBreed };
        }

        if (gender) {
            petGender = JSON.parse(gender);
            query.gender = { $in: petGender };
        }

        if (escapedSearch) {
            query.$or = [
                { pet_name: { $regex: escapedSearch, $options: "i" } },
                { pet_type: { $regex: escapedSearch, $options: "i" } },
                { pet_breed: { $regex: escapedSearch, $options: "i" } },
                { gender: { $regex: escapedSearch, $options: "i" } },
                { description: { $regex: escapedSearch, $options: "i" } },
            ];
        }

        const total_pets = await pets.countDocuments(query);

        const pet_list = await pets.aggregate([
            {
                $match: query,
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit),
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: "pet_likes",
                    let: { localId: "$_id", userId: user_id },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$userId"] },
                                        { $eq: ["$pet_id", "$$localId"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "pet_like",
                }
            },
            {
                $lookup: {
                    from: "pet_albums",
                    let: {
                        petId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$pet_id", "$$petId"] },
                                        { $eq: ["$album_type", "image"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "pet_album"
                }
            },
            {
                $addFields: {
                    is_user_liked: {
                        $cond: { if: { $gt: [{ $size: '$pet_like' }, 0] }, then: true, else: false }
                    },
                    pet_media: {
                        $cond: {
                            if: { $gt: [{ $size: "$pet_album" }, 0] },
                            then: { $concat: [process.env.BUCKET_URL, { $arrayElemAt: ["$pet_album.album_path", 0] }] },
                            else: null
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    pet_name: 1,
                    pet_type: 1,
                    pet_breed: 1,
                    location: 1,
                    address: 1,
                    gender: 1,
                    price: 1,
                    description: 1,
                    is_adopted: 1,
                    is_deleted: 1,
                    is_user_liked: 1,
                    pet_media: 1,
                }
            }
        ]);

        return multiSuccessRes(res, res.__("Pets list get successfully."), total_pets, pet_list);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const guestPetListing = async (req, res) => {
    try {
        const { search = "", pet_type, pet_breed, gender, page = 1, limit = 10, lat, long, miles_distance = 100, ln } = req.body;
        i18n.setLocale(req, ln);

        const escapedSearch = search ? await escapeRegex(search) : null;

        const query = {
            is_deleted: false,
            is_adopted: false,
        }

        if (lat && long) {
            const earthRadiusInMiles = 3963.2;
            const distanceInMiles = parseInt(miles_distance);

            const lat1 = parseFloat(lat);
            const long1 = parseFloat(long);

            const radians = distanceInMiles / earthRadiusInMiles;

            const minLat = lat1 - radians * (180 / Math.PI);
            const maxLat = lat1 + radians * (180 / Math.PI);
            const minLong =
                long1 - (radians * (180 / Math.PI)) / Math.cos((lat1 * Math.PI) / 180);
            const maxLong =
                long1 + (radians * (180 / Math.PI)) / Math.cos((lat1 * Math.PI) / 180);

            query.location = {
                $geoWithin: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: [
                            // [
                            //     [minLat, minLong],
                            //     [minLat, maxLong],
                            //     [maxLat, maxLong],
                            //     [maxLat, minLong],
                            //     [minLat, minLong],
                            // ],
                            [
                                [minLong, minLat],
                                [maxLong, minLat],
                                [maxLong, maxLat],
                                [minLong, maxLat],
                                [minLong, minLat],
                            ],
                        ],
                    },
                },
            }
        }

        let petType = [];
        let petBreed = [];
        let petGender = [];

        if (pet_type) {
            petType = JSON.parse(pet_type);
            query.pet_type = { $in: petType };
        }

        if (pet_breed) {
            petBreed = JSON.parse(pet_breed);
            query.pet_breed = { $in: petBreed };
        }

        if (gender) {
            petGender = JSON.parse(gender);
            query.gender = { $in: petGender };
        }

        if (escapedSearch) {
            query.$or = [
                { pet_name: { $regex: escapedSearch, $options: "i" } },
                { pet_type: { $regex: escapedSearch, $options: "i" } },
                { pet_breed: { $regex: escapedSearch, $options: "i" } },
                { gender: { $regex: escapedSearch, $options: "i" } },
                { description: { $regex: escapedSearch, $options: "i" } },
            ];
        }

        const total_pets = await pets.countDocuments(query);

        const pet_list = await pets.aggregate([
            {
                $match: query,
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit),
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: "pet_albums",
                    let: {
                        petId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$pet_id", "$$petId"] },
                                        { $eq: ["$album_type", "image"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "pet_album"
                }
            },
            {
                $addFields: {
                    is_user_liked: false,
                    pet_media: {
                        $cond: {
                            if: { $gt: [{ $size: "$pet_album" }, 0] },
                            then: { $concat: [process.env.BUCKET_URL, { $arrayElemAt: ["$pet_album.album_path", 0] }] },
                            else: null
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    pet_name: 1,
                    pet_type: 1,
                    pet_breed: 1,
                    location: 1,
                    address: 1,
                    gender: 1,
                    price: 1,
                    description: 1,
                    is_adopted: 1,
                    is_deleted: 1,
                    is_user_liked: 1,
                    pet_media: 1,
                }
            }
        ]);

        return multiSuccessRes(res, res.__("Pets list get successfully."), total_pets, pet_list);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

module.exports = {
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
};
