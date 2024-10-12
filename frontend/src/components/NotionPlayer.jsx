import React, { useState } from "react";

export const NotionPlayer = () => {
    return <div className="h-screen w-full bg-neutral-900 text-neutral-50">
        <Board />
    </div>;
}

//genero un componente para un tablero
const Board = () => {
    //genero un estado para cartas
    const [cards, setCards] = useState([]);

    return (
        <div className="flex h-full w-full gap-3 overflow-scroll p-12">
            <Column
                title = "Team 1"
                column = "team1"
                headingColor = "text-red-500"
                cards = {cards}
                setCards= {setCards}
            />

            <Column
                title = "Team 2"
                column = "team1"
                headingColor = "text-green-500"
                cards = {cards}
                setCards= {setCards}
            />

            <Column
                title = "Team 3"
                column = "team1"
                headingColor = "text-yellow-500"
                cards = {cards}
                setCards= {setCards}
            />

            <Column
                title = "Team 4"
                column = "team1"
                headingColor = "text-blue-500"
                cards = {cards}
                setCards= {setCards}
            />
        </div>
    )
}

//genero un componente para columna que representara un equipo
const Column = ({ title, headingColor, column, cards, setCards}) => {
    return (
        <div className="w-56 shrink-0">
            <div className="mb-3 flex items-center justify-between">
                <h3 className={ `font-medium ${headingColor}`}>{title}</h3>
                <span className="rounded text-sm text-neutral-400">{cards.length}</span>
            </div>
        </div>
    )
}