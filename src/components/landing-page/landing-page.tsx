import { useRouter } from "next/navigation";

export default function LandingPage() {
    const router = useRouter();

    return (
        <div>
            <div className="flex justify-center items-center m-10">
                <div className="rounded-md shadow-md p-2">
                    Erstellen Sie KI-gestützte Transskriptionen und interaktive Zusammenfassungen!
                </div>
            </div>
            <div className="flex flex-row justify-around m-10">
                <div className="min-w-20 max-w-60 w-full p-4 m-5 shadow-md rounded-md">
                    Lorem Ipsum
                </div>
                <div className="w-full h-[500px] m-5">
                    <img></img>
                </div>
            </div>
            <div className="flex justify-center items-center">
                <div className="bg-red-600 border-red-700 border rounded-lg shadow-md hover:bg-red-700 hover:border-red-800 p-3">
                    Jetzt starten
                </div>
            </div>
        </div>
    )
}