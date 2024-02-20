import $ivy.`com.github.tototoshi::scala-csv:1.3.10`
import $ivy.`io.circe::circe-yaml:0.14.2`
import $ivy.`io.circe::circe-generic:0.14.6`
import $ivy.`com.github.slugify:slugify:3.0.6`

import com.github.tototoshi.csv.{ CSVReader, defaultCSVFormat }
import cats.syntax.option._
import io.circe.generic.auto._
import io.circe.syntax._
import io.circe.yaml.syntax._
import io.circe.yaml.Printer
import com.github.slugify.Slugify

import java.nio.file.Files

import scala.util.Random

case class EquipmentSystem(
  description: String,
  cost: BigDecimal,
  encumbrance: Option[BigDecimal],
  quantity: Option[Int],
  state: String,
  `type`: String,
  traits: Option[List[String]]
)

case class Equipment(
  _id: String,
  fileType: String,
  folder: String,
  img: String,
  name: String,
  system: EquipmentSystem,
  `type`: String,
):
  def fileName(implicit slugify: Slugify): String = s"${fileType}.${slugify.slugify(name)}.yaml"

def generateId: String = 
  val characters = (('a' to 'z') ++ ('A' to 'Z') ++ ('0' to '9')).toVector
  LazyList
    .continually(Random.nextPrintableChar)
    .filter(characters.contains)
    .take(16)
    .mkString

def buildEquipment(data: List[String]): Option[Equipment] = data match
  case name :: img :: cost :: enc :: traits :: description :: Nil => 
    Equipment(
      _id = generateId,
      fileType = "items",
      folder = "2cMno9TdAHHB1UkH",
      img = s"systems/oq/assets/icons/$img",
      name = name,
      system = EquipmentSystem(
        description = description,
        cost = BigDecimal(cost),
        encumbrance = if enc.trim.isEmpty then none else BigDecimal(enc).some,
        quantity = 1.some,
        state = "carried",
        `type` = "single",
        traits = if traits.trim.isEmpty then none else traits.trim.split(",").map(_.trim).toList.some
      ),
      `type` = "equipment"
    ).some
  case _ => None

  

@main
def buildEquipments(csvFile: os.Path, outDir: os.Path, dryRun: Boolean = false): Unit =
  implicit val slugify = Slugify.builder.build
  val yamlPrinter = Printer(
    preserveOrder = true,
    dropNullKeys = true,
  )
  val reader = CSVReader.open(csvFile.toIO)
  val elements = reader
    .all()
    .tail
    .map(buildEquipment)
    .flatten
    .map(e => e.fileName -> yamlPrinter.pretty(e.asJson))

  if dryRun then
    elements.foreach{ case (fileName, content) => println(fileName); println(content); println()}
  else
    val file = outDir.toIO
    if !file.exists then
      Files.createDirectory(outDir.toNIO)
    elements.foreach{ case (fileName, content) => 
      val outPath = outDir / fileName
      Files.writeString(outPath.toNIO, content)
    }
    
