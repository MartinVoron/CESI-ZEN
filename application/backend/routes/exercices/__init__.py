from flask import Blueprint

exercices_bp = Blueprint('exercices', __name__)

from . import get_exercices, create_exercice, update_exercice 