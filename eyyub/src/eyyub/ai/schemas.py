from typing_extensions import TypedDict, Annotated


class PersonBaseInfo(TypedDict):
    """A person entry from the fountain list."""

    Sıra: Annotated[str, ..., "Listed order number (as written)"]
    Adı: Annotated[str, ..., "Full name"]
    Tanım: Annotated[str, ..., "Short description / title"]
    Doğum: Annotated[str, ..., "Birth date or approximate birth year (as written)"]
    Ölüm: Annotated[str, ..., "Death date or approximate death year (as written)"]
    Kategori: Annotated[str, ..., "Category (e.g., Devlet Adamları)"]


class PersonExtendedInfo(PersonBaseInfo):
    """A person entry with extended details."""

    about: Annotated[str, ..., "Detailed biography or description"]
    sources: Annotated[list[str], ..., "List of source URLs or references"]
    image_url: Annotated[str | None, ..., "URL to an image of the person, if available"]
