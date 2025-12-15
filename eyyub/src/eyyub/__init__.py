import typer
from rich import print
from rich.prompt import Prompt, Confirm


app = typer.Typer()


@app.command()
def hello(name: str):
    print(f"[red]Hello[/red] [bold green]{name}[/bold green]")

@app.command()
def askname():
    name = Prompt.ask("What is your name?")
    print(f"You entered: {name}")

@app.command()
def askbool():
    answer = Confirm.ask("Do you want to continue?", default=True)
    print(f"You answered: {answer}")
