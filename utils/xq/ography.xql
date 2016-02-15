xquery version "3.0";

module namespace og="http://amclark42.net/perspectography/ns/functions";
import module namespace rest="http://exquery.org/ns/restxq";
import module namespace sxn="http://exist-db.org/xquery/transform";
import module namespace xqjson="http://xqilla.sourceforge.net/lib/xqjson";

declare namespace http="http://expath.org/ns/http-client";
declare namespace output="http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace tei="http://www.tei-c.org/ns/1.0";

(:declare option output:encoding "UTF-8";:)

(:~
 : A library of RESTXQ functions.
 : 
 : @author Ashley M. Clark
 : @version 1.0
 :)

(: Use the datapath in the configuration file. :)
declare variable $og:configFile := doc('../../config.xml');

(:
 : RESTXQ FUNCTIONS
 :)
 
declare 
  %rest:GET
  %rest:path("/perspectography")
  %output:method("text")
function og:list-datasets() {
  let $list := 
    <json type="array">
      {
        for $dataset in $og:configFile//dataSet
        return og:get-dataset-info($dataset)
      }
    </json>
  return xqjson:serialize-json($list)
 };

  (: eXist 2.2 has a bug where declaring the media-type to be JSON also removes 
    the default encoding of UTF-8. To get around that, I'm currently using the 
    output method for plain text. :)
  (:%output:media-type("application/json"):)
declare 
  %rest:GET
  %rest:path("/perspectography/{$datasetName}/bibl")
  %rest:query-param("offset","{$offset}","1")
  %rest:query-param("max","{$max}","50")
  %output:method("text")
function og:get-bibliography($datasetName, $offset, $max) {
  let $dataset := $og:configFile//dataSet[@name eq $datasetName]
  return 
    if ( $dataset ) then
      let $pathToFiles := data($dataset//directoryPath/@target)
      let $allFiles := collection(concat($pathToFiles,'/?select=*.xml'))
      let $allBiblStructs := $allFiles//tei:listBibl/tei:biblStruct
      let $compiledData := 
        <json type="array">
          {
            for $entry in subsequence($allBiblStructs,$offset,$max)
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

declare
  %rest:GET
  %rest:path("/perspectography/{$datasetName}/persons")
  %rest:query-param("offset","{$offset}","1")
  %rest:query-param("max","{$max}","50")
  %output:method("text")
function og:get-personography($datasetName, $offset, $max) {
  let $resultSet := og:retrieve-result-set($datasetName,'persons',$offset,$max)
  return 
    if ( not($resultSet castable as xs:boolean) ) then
      let $compiledData := 
        <json type="array">
          {
            for $entry in $resultSet
            return og:get-person-data($entry)
          }
        </json>
      return xqjson:serialize-json($compiledData)
    else 
      <rest:response>
        <http:response status="404">
        </http:response>
      </rest:response>
};

(:declare
  %rest:POST
function og:make-person($nameParts) {
  
};:)

(:
 : SUPPORT FUNCTIONS
 :)

declare function og:retrieve-result-set($datasetName as xs:string, $resultsType as xs:string, $offset as xs:integer, $max as xs:integer) {
  let $dataset := $og:configFile//dataSet[@name eq $datasetName]
  return 
    if ( $dataset ) then
      let $pathToFiles := data($dataset//directoryPath/@target)
      let $allFiles := collection(concat($pathToFiles,'/?select=*.xml'))
      let $allEntries := switch ( $resultsType ) 
                            case "bibls" return $allFiles//tei:listBibl/tei:biblStruct
                            case "persons" return $allFiles//tei:listPerson/tei:person
                            default return false()
      return subsequence($allEntries,$offset,$max)
    else false()
};

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

declare function og:get-dataset-info($entry) as node() {
  <pair type="object">
    <pair name="name" type="string">{ $entry/@name/data(.) }</pair>
    <pair name="url" type="string">/restxq/perspectography/{ $entry/@name/data(.) }</pair>
  </pair>
};

declare function og:get-bibliographic-data($entry as node()) as node() {
  <pair type="object">
    <pair name="id" type="string">{data($entry/@xml:id)}</pair>
    <pair name="title" type="string">{normalize-space(string-join($entry//tei:monogr/tei:title[1]//text(),' '))}</pair>
    <pair name="creators" type="array">
      {
        for $creator in $entry//(tei:author|tei:editor|tei:respStmt) (: |tei:publisher :)
                              /(tei:persName|tei:name|tei:orgName)
        let $nameRef := if ( $creator[parent::tei:publisher] ) then
                          $creator/text()
                        else
                          $creator/data(@ref)
        return 
          <item type="object">
            <pair name="pid" type="string">{$nameRef}</pair>
            <pair name="roles" type="array">
              {
                for $element in $creator/parent::*/name()
                let $roles := if ( $element eq 'respStmt' ) then
                                for $resp in $creator/parent::tei:respStmt/tei:resp
                                return 
                                  <item type="string">
                                    { $resp/data(@relation) }
                                  </item>
                              else <item type="string">{ $element }</item>
                return $roles
              }
            </pair>
          </item>
      }
    </pair>
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
              <item type="string">{$catDesc}</item>
          }
        </pair>
      else ()
    }
  </pair>
};

declare function og:get-person-data($entry as node()) as node() {
  <pair type="object">
    <pair name="id" type="string">{data($entry/@xml:id)}</pair>
    <pair name="names" type="array">
      {
        for $name in $entry/tei:persName
        return 
          <pair type="object">
            {
              for $part in $name//tei:*
              return 
                <pair name="{$part/local-name(.)}{if ( $part/@type ) then concat('-',data($part/@type)) else ''}" type="string">
                  { normalize-space($part) }
                </pair>
            }
          </pair>
      }
    </pair>
  </pair>
};
