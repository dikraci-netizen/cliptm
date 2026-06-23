# Agrégateur d'offres d'emploi (Maroc)

Ce dépôt fournit un script Python (`job_scraper.py`) qui interroge des sources publiques marocaines (emploi-public.ma et anapec.org) pour extraire les offres d'emploi et les transformer en un tableau HTML prêt à l'emploi.

## Installation

Le script repose uniquement sur la bibliothèque standard Python : aucune
installation de paquets n'est nécessaire pour l'exécuter ou pour utiliser les
parseurs dans les tests.

> Astuce : si vous souhaitez exécuter la suite `pytest` mais n'avez pas Pytest
> installé, vous pouvez l'ajouter avec `python -m pip install pytest` (ou votre
> gestionnaire préféré).

## Utilisation

Récupérer les offres et générer un fichier `offres.html` :

```bash
python job_scraper.py --output offres.html
```

Options utiles :
- `--limit 30` limite le nombre d'offres par source.
- `--sources emploi-public anapec` sélectionne les sources interrogées.
- `--timeout 20` ajuste le délai réseau (secondes).

Si l'argument `--output` est omis, le HTML est envoyé dans la sortie standard.

## Résultat

Le fichier HTML contient un tableau avec :
- Titre de l'offre
- Organisation
- Lieu
- Source
- Date de publication (si disponible)
- Deadline (si disponible)
- Lien direct pour postuler

## Personnalisation des sélecteurs

Les sites officiels peuvent changer de structure. Les fonctions `parse_emploi_public` et `parse_anapec` appliquent des sélecteurs défensifs (tableaux, cartes, listes). Si une source évolue, ajustez ces sélecteurs dans `job_scraper.py` pour correspondre au nouveau balisage sans modifier la logique globale.

## Tests

Une suite minimale valide la transformation des données en HTML et la capacité des parseurs à extraire des offres depuis des extraits HTML représentatifs. Lancez-la avec :

```bash
python -m pytest
```

## Limitations

- Les sites peuvent imposer des règles anti-robot ou modifier leurs pages ; il peut être nécessaire d'ajouter des délais ou d'utiliser des proxys conformes aux conditions d'utilisation.
- Les dates sont interprétées au format `JJ/MM/AAAA`, `AAAA-MM-JJ` ou `JJ-MM-AAAA`. Ajustez `_parse_date` pour d'autres formats si besoin.
