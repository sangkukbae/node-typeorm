import "reflect-metadata";
import { createConnection } from "typeorm";
import { Album } from "./entity/Album";
import { Photo } from "./entity/Photo";
import { PhotoMetadata } from "./entity/PhotoMetadata";

createConnection().then(async connection => {

    let album1 = new Album();
    album1.name = "Bears";
    await connection.manager.save(album1);

    let album2 = new Album();
    album2.name = "Me";
    await connection.manager.save(album2);

    let photo = new Photo();
    photo.name = "Me and Bears";
    photo.description = "I am near polar bears";
    photo.filename = "photo-with-bears.jpg";
    photo.views = 1;
    photo.isPublished = true;
    photo.albums = [album1, album2];

    let metadata = new PhotoMetadata();
    metadata.height = 640;
    metadata.width = 480;
    metadata.compressed = true;
    metadata.comment = "cybershoot";
    metadata.orientation = "portrait";
    metadata.photo = photo;

    await connection.manager.save(photo);

    const loadedPhoto = await connection.getRepository(Photo).findOne(1, { relations: ["albums"] });

    console.log("loadedPhoto: ", loadedPhoto);

    let photoRepository = connection.getRepository(Photo);
    // join
    // let photos = await photoRepository.find({ relations: ["metadata"] });

    // inner join 
    // let photos = await connection.getRepository(Photo).createQueryBuilder("photo").innerJoinAndSelect("photo.metadata", "metadata").getMany();
    // console.log("photos: ", photos);

    let photos = await connection
        .getRepository(Photo)
        .createQueryBuilder("photo")
        .innerJoinAndSelect("photo.metadata", "metadata")
        .leftJoinAndSelect("photo.albums", "album")
        .where("photo.isPublished = true")
        .andWhere("(photo.name = :photoName OR photo.name = :bearName)")
        .orderBy("photo.id", "DESC")
        .skip(5)
        .take(10)
        .setParameters({ photoName: "My", bearName: "Mishka" })
        .getMany();

    console.log("photos: ", photos);


    let metadataRepository = connection.getRepository(PhotoMetadata);

    await photoRepository.save(photo);
    // console.log("Photo has been saved");

    await metadataRepository.save(metadata);
    // let allPhotos = await photoRepository.find();
    // console.log("All photos from db: ", allPhotos);

    let firstPhoto = await photoRepository.findOne(1);
    console.log("First photo from db: ", firstPhoto);

    let meAndBearsPhoto = await photoRepository.findOne({ name: "Me and Bears" });
    console.log("Me and bears photo from db: ", meAndBearsPhoto);

    let [allPhotos, photoCount] = await photoRepository.findAndCount();
    console.log("All photos: ", allPhotos, "Photos count: ", photoCount);

    // update
    let photoToUpdate = await photoRepository.findOne(1);
    photoToUpdate.name = "Me, my friends and polar bears";
    await photoRepository.save(photoToUpdate);

    // remove
    // let photoToRemove = await photoRepository.findOne(2);
    // await photoRepository.remove(photoToRemove);

}).catch(error => console.log(error));