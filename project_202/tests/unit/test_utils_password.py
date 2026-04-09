from routes import utils


def test_get_password_hash_and_verify_password_success():
    plain_password = "safe-password-123"

    hashed_password = utils.get_password_hash(plain_password)

    assert hashed_password != plain_password
    assert utils.verify_password(plain_password, hashed_password) is True


def test_verify_password_fails_for_wrong_password():
    hashed_password = utils.get_password_hash("correct-password")

    assert utils.verify_password("wrong-password", hashed_password) is False
