export default function GetFormatedDate(d: Date): string {
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
}