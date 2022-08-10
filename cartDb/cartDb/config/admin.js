module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '06e446fa2591b6460c8646493c5e0f3f'),
  },
});
