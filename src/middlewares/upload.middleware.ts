import multer from 'multer';

const storage = multer.memoryStorage(); // stores file in memory as Buffer

export const upload = multer({ storage });
