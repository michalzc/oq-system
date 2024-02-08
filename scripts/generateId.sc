import scala.util.Random

@main
def generateId(length: Int = 16, count: Int = 10): Unit =
  val characters = (('a' to 'z') ++ ('A' to 'Z') ++ ('0' to '9')).toVector
  List.fill(count)(
    LazyList
      .continually(Random.nextPrintableChar)
      .filter(characters.contains)
      .take(length)
      .mkString
  ).foreach(println)
