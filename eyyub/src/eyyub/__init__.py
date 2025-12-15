import typer
from typing_extensions import Annotated
from rich import print
from rich.prompt import Prompt, Confirm


app = typer.Typer()


def complete_name():
    return ["GENÇ", "Test", "Deneme"]


@app.command()
def hello(
    name: Annotated[
        str, typer.Argument(help="The name of the user to greet")
    ] = "Eyyub",
    lastname: Annotated[
        str,
        typer.Option(
            help="Last name of person to greet.", autocompletion=complete_name
        ),
    ] = "",
):
    """
    Docstring for hello

    :param name: Description
    :type name: Annotated[str, typer.Argument(help="The name of the user to greet")]
    """
    print(f"[red]Hello[/red] [bold green]{name}[/bold green] {lastname}!")


@app.command()
def login(
    email: Annotated[str, typer.Option(prompt=True, confirmation_prompt=True)],
    password: Annotated[
        str, typer.Option(prompt=True, confirmation_prompt=True, hide_input=True)
    ],
):
    print(
        f"You email is [bold]{email}[/bold] and your password is [bold]{password}[/bold]"
    )


@app.command()
def askbool():
    answer = Confirm.ask("Do you want to continue?", default=True)
    print(f"You answered: {answer}")
