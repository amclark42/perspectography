xquery version "3.0";

module namespace og="http://amclark42.net/perspectography/ns/functions";
import module namespace rest="http://exquery.org/ns/restxq";
import module namespace sxn="http://exist-db.org/xquery/transform";
import module namespace xqjson="http://xqilla.sourceforge.net/lib/xqjson";

declare namespace http="http://expath.org/ns/http-client";
declare namespace output="http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace tei="http://www.tei-c.org/ns/1.0";

(:~
 : A library of RESTXQ functions.
 : 
 : @author Ashley M. Clark
 : @version 1.0
 :)

(: Use the datapath in the configuration file. :)
declare variable $og:configFile := doc('../../config.xml');

declare function og:resolve-reference($ref, $currentDoc as node()) {
  if ( matches($ref,"^(file://)?[-_\.\w/]+#") ) then
    let $filepath := substring-before($ref,"#")
    let $doc := doc($filepath)
    let $idRef := substring-after($ref,"#")
    return $doc/id($idRef)
  else if ( matches($ref,"^#") ) then
    let $idRef := substring-after($ref,"#")
    return $currentDoc/id($idRef)
  else $currentDoc/id($ref)
};

declare function og:get-bibliographic-data($entry as node()) as node() {
  <pair type="object">
    <pair name="id" type="string">{data($entry/@xml:id)}</pair>
    <pair name="title" type="string">{normalize-space(string-join($entry//tei:monogr/tei:title[1]//text(),' '))}</pair>
    <pair name="creators" type="array"></pair>
    {
      if ( $entry//tei:series ) then
        <pair name="series" type="array">
          {
            for $series in $entry//tei:series
            return 
              <item type="string">{ $series//tei:title[1] }</item>
          }
        </pair>
      else ()
    }
    {
      if ( $entry//tei:catRef ) then
        <pair name="tags" type="array">
          {
            for $tag in $entry//tei:catRef
            let $catDesc := data($tag/@target)
            return
              (:<item type="object">:)
                <item type="string">{$catDesc}</item>
              (:</item>:)
          }
        </pair>
      else ()
    }
  </pair>
};

declare 
  %rest:GET
  %rest:path("/perspectography/{$datasetName}/bibl")
  %output:media-type("application/json")
function og:get-bibliography($datasetName) {
  let $dataset := $og:configFile//dataSet[@name eq $datasetName]
  return 
    if ( $dataset ) then
      let $pathToFiles := data($dataset//directoryPath/@target)
      let $allFiles := collection(concat($pathToFiles,'/?select=*.xml'))
      let $compiledData := 
        <json type="array">
          {
            for $entry in $allFiles//tei:listBibl/tei:biblStruct
            return og:get-bibliographic-data($entry)
          }
        </json>
      return xqjson:serialize-json($compiledData)
    else 
      <rest:response>
        <http:response status="404">
        </http:response>
      </rest:response>
};

