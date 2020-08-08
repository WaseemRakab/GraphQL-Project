import {Observable} from 'rxjs';

export const generateBase64FromImageFile = (imageFile: Blob) => {
  const reader = new FileReader();
  const observable = new Observable<string>(subscriber => {
    reader.onload = e => subscriber.next(e.target.result as string);
    reader.onabort = err => subscriber.error(err);
    reader.onloadend = () => subscriber.complete();
  });
  reader.readAsDataURL(imageFile);
  return observable;
};

export const getImageFileFromBlob = (imageUrl: string, imageFile: Blob) => {
  return new File([imageFile], imageUrl.split('/').pop(), {type: imageFile.type});
};
