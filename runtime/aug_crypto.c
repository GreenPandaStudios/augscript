#include "aug_runtime.h"
#include <gnutls/gnutls.h>
#include <gnutls/crypto.h>
#include <gnutls/abstract.h>
#include <gnutls/x509.h>
#include <pthread.h>
#include <stdlib.h>
#include <limits.h>

static pthread_once_t initialization = PTHREAD_ONCE_INIT;
static int initialization_status;
static void initialize(void) { initialization_status = gnutls_global_init(); }
static bool ready(void) { pthread_once(&initialization, initialize); return initialization_status >= 0; }
static gnutls_datum_t datum(AugValue value) {
  return (gnutls_datum_t){(unsigned char *)value.as.object->text, (unsigned int)value.as.object->text_length};
}
static bool buffer(AugValue value, int kind) {
  return value.tag == AUG_OBJECT && value.as.object && value.as.object->kind == kind &&
    !value.as.object->dropped && value.as.object->text_length <= UINT_MAX;
}
static AugValue failure(void) { return aug_error_named("CryptoError"); }
static int private_key(AugValue value, gnutls_privkey_t *key) {
  if (!ready() || !buffer(value, AUG_PRIVATE_KEY_KIND)) return -1;
  int status = gnutls_privkey_init(key);
  if (status >= 0) {
    gnutls_datum_t input = datum(value);
    status = gnutls_privkey_import_x509_raw(*key, &input, GNUTLS_X509_FMT_DER, NULL, 0);
  }
  return status;
}
AugValue _aug_crypto_random(AugValue size) {
  if (!ready() || size.tag != AUG_INT || size.as.integer < 0 || size.as.integer > 16 * 1024 * 1024) return failure();
  size_t count = (size_t)size.as.integer;
  unsigned char *bytes = malloc(count ? count : 1); if (!bytes) return failure();
  int status = gnutls_rnd(GNUTLS_RND_RANDOM, bytes, count);
  AugValue result = status < 0 ? failure() : aug_bytes(bytes, count, AUG_BYTES_KIND);
  free(bytes); return result;
}
AugValue _aug_crypto_sha256(AugValue input) {
  if (!ready() || !buffer(input, AUG_BYTES_KIND)) return failure();
  unsigned char digest[32];
  if (gnutls_hash_fast(GNUTLS_DIG_SHA256, input.as.object->text, input.as.object->text_length, digest) < 0) return failure();
  return aug_bytes(digest, sizeof(digest), AUG_BYTES_KIND);
}
AugValue _aug_crypto_generate_rsa(void) {
  if (!ready()) return failure();
  gnutls_x509_privkey_t key = NULL; gnutls_datum_t encoded = {0};
  int status = gnutls_x509_privkey_init(&key);
  if (status >= 0) status = gnutls_x509_privkey_generate(key, GNUTLS_PK_RSA, 3072, 0);
  if (status >= 0) status = gnutls_x509_privkey_export2_pkcs8(key, GNUTLS_X509_FMT_DER, NULL, GNUTLS_PKCS_PLAIN, &encoded);
  AugValue result = status < 0 ? failure() : aug_bytes(encoded.data, encoded.size, AUG_PRIVATE_KEY_KIND);
  if (encoded.data) { gnutls_memset(encoded.data, 0, encoded.size); gnutls_free(encoded.data); }
  if (key) gnutls_x509_privkey_deinit(key);
  return result;
}
AugValue _aug_crypto_public_rsa(AugValue key) {
  gnutls_privkey_t private = NULL; gnutls_pubkey_t public = NULL; gnutls_datum_t encoded = {0};
  int status = private_key(key, &private);
  if (status >= 0) status = gnutls_pubkey_init(&public);
  if (status >= 0) status = gnutls_pubkey_import_privkey(public, private, 0, 0);
  if (status >= 0) status = gnutls_pubkey_export2(public, GNUTLS_X509_FMT_DER, &encoded);
  AugValue result = status < 0 ? failure() : aug_bytes(encoded.data, encoded.size, AUG_PUBLIC_KEY_KIND);
  if (encoded.data) gnutls_free(encoded.data);
  if (public) gnutls_pubkey_deinit(public);
  if (private) gnutls_privkey_deinit(private);
  return result;
}
AugValue _aug_crypto_sign_rsa(AugValue key, AugValue input) {
  if (!buffer(input, AUG_BYTES_KIND)) return failure();
  gnutls_privkey_t private = NULL; gnutls_datum_t signature = {0}, data = datum(input);
  int status = private_key(key, &private);
  if (status >= 0) status = gnutls_privkey_sign_data2(private, GNUTLS_SIGN_RSA_SHA256, 0, &data, &signature);
  AugValue result = status < 0 ? failure() : aug_bytes(signature.data, signature.size, AUG_BYTES_KIND);
  if (signature.data) gnutls_free(signature.data);
  if (private) gnutls_privkey_deinit(private);
  return result;
}
AugValue _aug_crypto_verify_rsa(AugValue publicKey, AugValue input, AugValue signature) {
  if (!ready() || !buffer(publicKey, AUG_PUBLIC_KEY_KIND) || !buffer(input, AUG_BYTES_KIND) || !buffer(signature, AUG_BYTES_KIND)) return failure();
  gnutls_pubkey_t key = NULL; gnutls_datum_t encoded = datum(publicKey), data = datum(input), sig = datum(signature);
  int status = gnutls_pubkey_init(&key);
  if (status >= 0) status = gnutls_pubkey_import(key, &encoded, GNUTLS_X509_FMT_DER);
  if (status < 0) { if (key) gnutls_pubkey_deinit(key); return failure(); }
  status = gnutls_pubkey_verify_data2(key, GNUTLS_SIGN_RSA_SHA256, 0, &data, &sig);
  gnutls_pubkey_deinit(key);
  return aug_bool(status >= 0);
}
AugValue _aug_crypto_decode_base64url(AugValue input) { return aug_base64url_decode(input); }
AugValue _aug_crypto_equal(AugValue left, AugValue right) {
  if (!buffer(left, AUG_BYTES_KIND) || !buffer(right, AUG_BYTES_KIND) || left.as.object->text_length != right.as.object->text_length) return aug_bool(false);
  return aug_bool(gnutls_memcmp(left.as.object->text, right.as.object->text, left.as.object->text_length) == 0);
}
AugValue _aug_crypto_export_rsa(AugValue publicKey) {
  if (!ready() || !buffer(publicKey, AUG_PUBLIC_KEY_KIND)) return failure();
  gnutls_pubkey_t key = NULL; gnutls_datum_t input = datum(publicKey), n = {0}, e = {0};
  int status = gnutls_pubkey_init(&key);
  if (status >= 0) status = gnutls_pubkey_import(key, &input, GNUTLS_X509_FMT_DER);
  if (status >= 0) status = gnutls_pubkey_export_rsa_raw2(key, &n, &e, GNUTLS_EXPORT_FLAG_NO_LZ);
  AugValue roots[2] = {0}; AugFrame frame; aug_frame_enter(&frame, roots, 2); AugValue result;
  if (status < 0) result = failure();
  else {roots[0] = aug_bytes(n.data, n.size, AUG_BYTES_KIND); roots[1] = aug_bytes(e.data, e.size, AUG_BYTES_KIND); result = aug_tuple_new(roots, 2); aug_freeze(result);}
  aug_frame_leave(&frame); if (n.data) gnutls_free(n.data); if (e.data) gnutls_free(e.data); if (key) gnutls_pubkey_deinit(key); return result;
}
AugValue _aug_crypto_import_rsa(AugValue modulus, AugValue exponent) {
  if (!ready() || !buffer(modulus, AUG_BYTES_KIND) || !buffer(exponent, AUG_BYTES_KIND)) return failure();
  gnutls_datum_t n = datum(modulus), e = datum(exponent), encoded = {0};
  if (n.size < 256 || n.size > 1024 || !n.data[0] || !(n.data[n.size - 1] & 1) || e.size < 1 || e.size > 4 || !e.data[0]) return failure();
  uint32_t power = 0; for (unsigned int i = 0; i < e.size; i++) power = (power << 8) | e.data[i]; if (power < 3 || !(power & 1)) return failure();
  gnutls_pubkey_t key = NULL; int status = gnutls_pubkey_init(&key); unsigned int bits = 0;
  if (status >= 0) status = gnutls_pubkey_import_rsa_raw(key, &n, &e);
  if (status >= 0 && (gnutls_pubkey_get_pk_algorithm(key, &bits) != GNUTLS_PK_RSA || bits < 2048 || bits > 8192)) status = -1;
  if (status >= 0) status = gnutls_pubkey_export2(key, GNUTLS_X509_FMT_DER, &encoded);
  AugValue result = status < 0 ? failure() : aug_bytes(encoded.data, encoded.size, AUG_PUBLIC_KEY_KIND);
  if (encoded.data) gnutls_free(encoded.data); if (key) gnutls_pubkey_deinit(key); return result;
}
AugValue _aug_crypto_password_hash(AugValue password, AugValue salt, AugValue iterations) {
  if (!ready() || !buffer(password, AUG_BYTES_KIND) || !buffer(salt, AUG_BYTES_KIND) || password.as.object->text_length > 1024 || salt.as.object->text_length < 16 || salt.as.object->text_length > 64 || iterations.tag != AUG_INT || iterations.as.integer < 100000 || iterations.as.integer > 2000000) return failure();
  gnutls_datum_t key = datum(password), input_salt = datum(salt); unsigned char output[32];
  int status = gnutls_pbkdf2(GNUTLS_MAC_SHA256, &key, &input_salt, (unsigned int)iterations.as.integer, output, sizeof(output));
  AugValue result = status < 0 ? failure() : aug_bytes(output, sizeof(output), AUG_BYTES_KIND); gnutls_memset(output, 0, sizeof(output)); return result;
}
